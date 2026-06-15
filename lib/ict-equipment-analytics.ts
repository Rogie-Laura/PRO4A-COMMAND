import { unstable_cache } from "next/cache"

import { fetchIctEquipmentSheetCsv } from "@/lib/google-sheets"
import { ICT_EQUIPMENT_SHEET } from "@/lib/ict-equipment-sheet"
import type { IctDeviceMetric, IctEquipmentAnalytics } from "@/lib/ict-equipment-types"

const RECAP_TOTAL_ROW = "Total"
const SERVICEABLE_DESKTOP_COL = 1
const SERVICEABLE_LAPTOP_COL = 2

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

function buildMetric(
  id: IctDeviceMetric["id"],
  label: string,
  value: number,
  detail: string,
): IctDeviceMetric {
  return { id, label, value, detail }
}

function emptyAnalytics(): IctEquipmentAnalytics {
  const detail = "Walang data mula sa RECAP tab"

  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: ICT_EQUIPMENT_SHEET.label,
    totalDesktop: buildMetric("desktop", "Total Desktop", 0, detail),
    totalLaptop: buildMetric("laptop", "Total Laptop", 0, detail),
  }
}

function parseRecapTotals(csv: string) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return null

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line)
    const unit = cells[0]?.trim()

    if (unit !== RECAP_TOTAL_ROW) continue

    const totalDesktop = parseNumber(cells[SERVICEABLE_DESKTOP_COL])
    const totalLaptop = parseNumber(cells[SERVICEABLE_LAPTOP_COL])

    if (totalDesktop === null || totalLaptop === null) continue

    return { totalDesktop, totalLaptop }
  }

  return null
}

async function loadIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  try {
    const csv = await fetchIctEquipmentSheetCsv()
    const totals = parseRecapTotals(csv)

    if (!totals) {
      return emptyAnalytics()
    }

    const detail = "Serviceable · 2025 and below · PRO CALABARZON"

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: ICT_EQUIPMENT_SHEET.label,
      totalDesktop: buildMetric(
        "desktop",
        "Total Desktop",
        totals.totalDesktop,
        detail,
      ),
      totalLaptop: buildMetric("laptop", "Total Laptop", totals.totalLaptop, detail),
    }
  } catch {
    return emptyAnalytics()
  }
}

const getCachedIctEquipmentAnalytics = unstable_cache(
  loadIctEquipmentAnalytics,
  ["ict-equipment-analytics-recap-v1"],
  { revalidate: 600 },
)

export async function getIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  return getCachedIctEquipmentAnalytics()
}
