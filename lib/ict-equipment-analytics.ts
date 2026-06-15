import { unstable_cache } from "next/cache"

import { ICT_OFFICE_UNITS, resolveIctOffice } from "@/lib/ict-equipment-config"
import { ICT_EQUIPMENT_SHEET } from "@/lib/ict-equipment-sheet"
import type {
  IctEquipmentAnalytics,
  IctOfficeBreakdownItem,
  IctPeriodBreakdown,
  IctStatusSection,
} from "@/lib/ict-equipment-types"
import { fetchIctEquipmentSheetCsv } from "@/lib/google-sheets"

const PERIOD_2025_COL = 1
const PERIOD_JAN_2026_COL = 2
const PERIOD_TOTAL_COL = 3
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

function parsePeriodBreakdown(cells: string[]): IctPeriodBreakdown | null {
  const year2025Below = parseNumber(cells[PERIOD_2025_COL])
  const asOfJanuary2026 = parseNumber(cells[PERIOD_JAN_2026_COL])
  const total = parseNumber(cells[PERIOD_TOTAL_COL])

  if (year2025Below === null || asOfJanuary2026 === null || total === null) {
    return null
  }

  if (total !== year2025Below + asOfJanuary2026) {
    return null
  }

  return { year2025Below, asOfJanuary2026, total }
}

function emptyStatusSection(
  label: string,
  detail: string,
): IctStatusSection {
  return {
    label,
    breakdown: {
      year2025Below: 0,
      asOfJanuary2026: 0,
      total: 0,
    },
    detail,
    offices: [],
  }
}

function emptyAnalytics(): IctEquipmentAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: ICT_EQUIPMENT_SHEET.label,
    serviceable: emptyStatusSection(
      "Serviceable ICT Equipment",
      "Walang data mula sa RECAP Serviceable block (row 19)",
    ),
    unserviceable: emptyStatusSection(
      "Unserviceable ICT Equipment",
      "Walang data mula sa RECAP Unserviceable block (row 31)",
    ),
  }
}

function buildOfficeBreakdown(
  rows: Array<{ unit: string; breakdown: IctPeriodBreakdown }>,
): IctOfficeBreakdownItem[] {
  const rowByUnit = new Map(rows.map((row) => [row.unit, row.breakdown]))

  return ICT_OFFICE_UNITS.flatMap((unit) => {
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

function parseAllStatusBlocks(csv: string) {
  const lines = csv.split(/\r?\n/).map(parseCsvLine)
  const blocks: Array<{
    breakdown: IctPeriodBreakdown
    offices: IctOfficeBreakdownItem[]
  }> = []

  for (let index = 0; index < lines.length; index++) {
    if (lines[index][0]?.trim() !== RECAP_UNIT_HEADER) continue

    const officeRows: Array<{ unit: string; breakdown: IctPeriodBreakdown }> = []
    let totalBreakdown: IctPeriodBreakdown | null = null

    for (let rowIndex = index + 1; rowIndex < lines.length; rowIndex++) {
      const cells = lines[rowIndex]
      const unit = cells[0]?.trim()
      if (!unit) continue

      if (unit === RECAP_UNIT_HEADER) break
      if (unit === RECAP_GRAND_TOTAL_ROW) break

      if (unit === RECAP_TOTAL_ROW) {
        totalBreakdown = parsePeriodBreakdown(cells)
        break
      }

      if (!ICT_OFFICE_UNITS.includes(unit as (typeof ICT_OFFICE_UNITS)[number])) {
        continue
      }

      const breakdown = parsePeriodBreakdown(cells)
      if (!breakdown) continue

      officeRows.push({ unit, breakdown })
    }

    if (officeRows.length !== ICT_OFFICE_UNITS.length || !totalBreakdown) {
      continue
    }

    blocks.push({
      breakdown: totalBreakdown,
      offices: buildOfficeBreakdown(officeRows),
    })
  }

  return blocks
}

async function loadIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  try {
    const csv = await fetchIctEquipmentSheetCsv()
    const blocks = parseAllStatusBlocks(csv)
    const serviceable = blocks[0]
    const unserviceable = blocks[1]

    if (!serviceable || !unserviceable) {
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
      unserviceable: {
        label: "Unserviceable ICT Equipment",
        breakdown: unserviceable.breakdown,
        detail: "Unserviceable · RECAP row 31 · PRO CALABARZON",
        offices: unserviceable.offices,
      },
    }
  } catch {
    return emptyAnalytics()
  }
}

const getCachedIctEquipmentAnalytics = unstable_cache(
  loadIctEquipmentAnalytics,
  ["ict-equipment-analytics-recap-v4"],
  { revalidate: 600 },
)

export async function getIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  return getCachedIctEquipmentAnalytics()
}
