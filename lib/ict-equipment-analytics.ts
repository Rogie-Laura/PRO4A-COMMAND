import { unstable_cache } from "next/cache"

import { fetchIctEquipmentSheetCsv } from "@/lib/google-sheets"
import { ICT_EQUIPMENT_SHEET } from "@/lib/ict-equipment-sheet"
import type { IctEquipmentAnalytics } from "@/lib/ict-equipment-types"

/** RECAP simplified block — row 29 (H, I, J) GRAND TOTAL columns. */
const GRAND_TOTAL_2025_COL = 7
const GRAND_TOTAL_JAN_2026_COL = 8
const GRAND_TOTAL_TOTAL_COL = 9
const RECAP_TOTAL_ROW = "Total"

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

function emptyAnalytics(): IctEquipmentAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: ICT_EQUIPMENT_SHEET.label,
    grandTotal: {
      label: "Total ICT Equipment",
      breakdown: {
        year2025Below: 0,
        asOfJanuary2026: 0,
        total: 0,
      },
      detail: "Walang data mula sa RECAP tab (H29, I29, J29)",
    },
  }
}

function parseGrandTotal(csv: string) {
  let match: {
    year2025Below: number
    asOfJanuary2026: number
    total: number
  } | null = null

  for (const line of csv.split(/\r?\n/)) {
    if (!line.trim()) continue

    const cells = parseCsvLine(line)
    if (cells[0]?.trim() !== RECAP_TOTAL_ROW) continue

    const year2025Below = parseNumber(cells[GRAND_TOTAL_2025_COL])
    const asOfJanuary2026 = parseNumber(cells[GRAND_TOTAL_JAN_2026_COL])
    const total = parseNumber(cells[GRAND_TOTAL_TOTAL_COL])

    if (year2025Below === null || asOfJanuary2026 === null || total === null) continue

    match = { year2025Below, asOfJanuary2026, total }
  }

  return match
}

async function loadIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  try {
    const csv = await fetchIctEquipmentSheetCsv()
    const breakdown = parseGrandTotal(csv)

    if (!breakdown) {
      return emptyAnalytics()
    }

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: ICT_EQUIPMENT_SHEET.label,
      grandTotal: {
        label: "Total ICT Equipment",
        breakdown,
        detail: "GRAND TOTAL · PRO CALABARZON · RECAP H29 / I29 / J29",
      },
    }
  } catch {
    return emptyAnalytics()
  }
}

const getCachedIctEquipmentAnalytics = unstable_cache(
  loadIctEquipmentAnalytics,
  ["ict-equipment-analytics-recap-v2"],
  { revalidate: 600 },
)

export async function getIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  return getCachedIctEquipmentAnalytics()
}
