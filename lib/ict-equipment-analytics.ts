import { unstable_cache } from "next/cache"

import {
  ICT_SERVICEABLE_UNITS,
  resolveIctOffice,
} from "@/lib/ict-equipment-config"
import { ICT_EQUIPMENT_SHEET } from "@/lib/ict-equipment-sheet"
import type {
  IctEquipmentAnalytics,
  IctOfficeBreakdownItem,
  IctServiceableBreakdown,
} from "@/lib/ict-equipment-types"
import { fetchIctEquipmentSheetCsv } from "@/lib/google-sheets"

const SERVICEABLE_2025_COL = 1
const SERVICEABLE_JAN_2026_COL = 2
const SERVICEABLE_TOTAL_COL = 3
const RECAP_UNIT_HEADER = "UNIT"
const RECAP_TOTAL_ROW = "Total"
const RECAP_GRAND_TOTAL_ROW = "Grand total"

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

function parseNumber(value: string | undefined) {
  const trimmed = value?.replace(/,/g, "").trim() ?? ""
  if (!trimmed || trimmed.startsWith("#")) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function parseServiceableBreakdown(cells: string[]): IctServiceableBreakdown | null {
  const year2025Below = parseNumber(cells[SERVICEABLE_2025_COL])
  const asOfJanuary2026 = parseNumber(cells[SERVICEABLE_JAN_2026_COL])
  const total = parseNumber(cells[SERVICEABLE_TOTAL_COL])

  if (year2025Below === null || asOfJanuary2026 === null || total === null) {
    return null
  }

  if (total !== year2025Below + asOfJanuary2026) {
    return null
  }

  return { year2025Below, asOfJanuary2026, total }
}

function emptyAnalytics(): IctEquipmentAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: ICT_EQUIPMENT_SHEET.label,
    serviceable: {
      label: "Serviceable ICT Equipment",
      breakdown: {
        year2025Below: 0,
        asOfJanuary2026: 0,
        total: 0,
      },
      detail: "Walang data mula sa RECAP Serviceable block (row 19)",
      offices: [],
    },
  }
}

function buildOfficeBreakdown(
  rows: Array<{ unit: string; breakdown: IctServiceableBreakdown }>,
): IctOfficeBreakdownItem[] {
  const rowByUnit = new Map(rows.map((row) => [row.unit, row.breakdown]))

  return ICT_SERVICEABLE_UNITS.flatMap((unit) => {
    const office = resolveIctOffice(unit)
    const breakdown = rowByUnit.get(unit)
    if (!office || !breakdown) return []

    return [
      {
        subUnit: office.subUnit,
        label: office.label,
        shortLabel: office.shortLabel,
        logo: office.logo,
        colorClass: office.colorClass,
        count: breakdown.total,
        breakdown,
      },
    ]
  })
}

function parseServiceableBlock(csv: string) {
  const lines = csv.split(/\r?\n/).map(parseCsvLine)

  for (let index = 0; index < lines.length; index++) {
    if (lines[index][0]?.trim() !== RECAP_UNIT_HEADER) continue

    const officeRows: Array<{ unit: string; breakdown: IctServiceableBreakdown }> = []
    let totalBreakdown: IctServiceableBreakdown | null = null

    for (let rowIndex = index + 1; rowIndex < lines.length; rowIndex++) {
      const cells = lines[rowIndex]
      const unit = cells[0]?.trim()
      if (!unit) continue

      if (unit === RECAP_UNIT_HEADER) break
      if (unit === RECAP_GRAND_TOTAL_ROW) break

      if (unit === RECAP_TOTAL_ROW) {
        totalBreakdown = parseServiceableBreakdown(cells)
        break
      }

      if (!ICT_SERVICEABLE_UNITS.includes(unit as (typeof ICT_SERVICEABLE_UNITS)[number])) {
        continue
      }

      const breakdown = parseServiceableBreakdown(cells)
      if (!breakdown) continue

      officeRows.push({ unit, breakdown })
    }

    if (officeRows.length !== ICT_SERVICEABLE_UNITS.length || !totalBreakdown) {
      continue
    }

    return {
      breakdown: totalBreakdown,
      offices: buildOfficeBreakdown(officeRows),
    }
  }

  return null
}

async function loadIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  try {
    const csv = await fetchIctEquipmentSheetCsv()
    const serviceable = parseServiceableBlock(csv)

    if (!serviceable) {
      return emptyAnalytics()
    }

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: ICT_EQUIPMENT_SHEET.label,
      serviceable: {
        label: "Serviceable ICT Equipment",
        breakdown: serviceable.breakdown,
        detail: "Serviceable · RECAP row 19 · PRO CALABARZON",
        offices: serviceable.offices,
      },
    }
  } catch {
    return emptyAnalytics()
  }
}

const getCachedIctEquipmentAnalytics = unstable_cache(
  loadIctEquipmentAnalytics,
  ["ict-equipment-analytics-recap-v3"],
  { revalidate: 600 },
)

export async function getIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  return getCachedIctEquipmentAnalytics()
}
