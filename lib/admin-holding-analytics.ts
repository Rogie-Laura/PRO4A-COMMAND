import { ADMIN_HOLDING_SHEET } from "@/lib/admin-holding-sheet"
import type {
  AdminHoldingAnalytics,
  AdminHoldingRecord,
  ParsedAdminHoldingWorkbook,
} from "@/lib/admin-holding-types"
import type { CountItem } from "@/lib/personnel-types"

export function emptyAdminHoldingAnalytics(fileName = ""): AdminHoldingAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: fileName || ADMIN_HOLDING_SHEET.label,
    total: 0,
    statusStats: [],
    records: [],
  }
}

export function isAdminHoldingDataRow(cols: string[]) {
  const no = cols[0]?.trim() ?? ""
  const rank = cols[1]?.trim() ?? ""
  const lastName = cols[2]?.trim() ?? ""

  if (rank.toUpperCase() === "RANK") return false
  return /^\d+$/.test(no) && rank.length > 0 && lastName.length > 0
}

export function mapAdminHoldingRow(cols: string[]): AdminHoldingRecord {
  return {
    no: Number.parseInt(cols[0] ?? "0", 10),
    rank: cols[1]?.trim() ?? "",
    lastName: cols[2]?.trim() ?? "",
    firstName: cols[3]?.trim() ?? "",
    middleName: cols[4]?.trim() ?? "",
    formerUnit: cols[6]?.trim() ?? "",
    badgeNumber: cols[7]?.trim() ?? "",
    status: normalizeStatus(cols[9]?.trim() ?? ""),
    authority: cols[10]?.trim() ?? "",
    remarks: cols[11]?.trim() ?? "",
  }
}

export function normalizeStatus(status: string) {
  const trimmed = status.trim()
  if (!trimmed) return "Unspecified"

  const lower = trimmed.toLowerCase()
  if (lower.startsWith("floating")) return "Floating"
  if (lower.includes("under suspension")) return "Under Suspension"
  if (lower === "awol") return "AWOL"
  if (lower === "nds") return "NDS"
  if (lower.includes("courtesy caller")) return "Courtesy Caller"
  if (lower === "reinstated") return "Reinstated"
  if (lower === "alawp") return "ALAWP"
  if (lower.includes("for tppd")) return "For TPPD"
  if (lower === "rtu") return "RTU"

  return trimmed
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" / ")
}

function buildStatusStats(records: AdminHoldingRecord[]): CountItem[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    counts.set(record.status, (counts.get(record.status) ?? 0) + 1)
  }

  const total = records.length || 1

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
}

export function parseAdminHoldingRows(rows: string[][]): AdminHoldingRecord[] {
  return rows.filter(isAdminHoldingDataRow).map(mapAdminHoldingRow)
}

export function buildAdminHoldingAnalyticsFromWorkbook(
  workbook: ParsedAdminHoldingWorkbook,
  options: { fileName: string; lastUpdated: string },
): AdminHoldingAnalytics {
  const records = workbook.records

  if (records.length === 0) {
    return emptyAdminHoldingAnalytics(options.fileName)
  }

  return {
    lastUpdated: options.lastUpdated,
    dataReady: true,
    dataSource: options.fileName,
    total: records.length,
    statusStats: buildStatusStats(records),
    records,
  }
}

export {
  ADMIN_HOLDING_ANALYTICS_CACHE_TAG,
  getAdminHoldingAnalytics,
} from "@/lib/admin-holding-records"

export function toAdminHoldingSummary(data: AdminHoldingAnalytics) {
  const { records: _records, ...summary } = data
  return summary
}
