import { unstable_cache } from "next/cache"

import { ADMIN_HOLDING_SHEET } from "@/lib/admin-holding-sheet"
import type { AdminHoldingAnalytics, AdminHoldingRecord, AdminHoldingSummary } from "@/lib/admin-holding-types"
import { fetchAdminHoldingSheetCsv, parseCsvRows } from "@/lib/google-sheets"
import type { CountItem } from "@/lib/personnel-types"

function emptyAnalytics(): AdminHoldingAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: ADMIN_HOLDING_SHEET.label,
    total: 0,
    statusStats: [],
    records: [],
  }
}

function isAdminHoldingDataRow(cols: string[]) {
  const no = cols[0]?.trim() ?? ""
  const rank = cols[1]?.trim() ?? ""
  const lastName = cols[2]?.trim() ?? ""

  if (rank.toUpperCase() === "RANK") return false
  return /^\d+$/.test(no) && rank.length > 0 && lastName.length > 0
}

function mapAdminHoldingRow(cols: string[]): AdminHoldingRecord {
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

function normalizeStatus(status: string) {
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

function parseAdminHoldingCsv(text: string): AdminHoldingRecord[] {
  const rows = parseCsvRows(text)

  return rows.filter(isAdminHoldingDataRow).map(mapAdminHoldingRow)
}

async function loadAdminHoldingAnalytics(): Promise<AdminHoldingAnalytics> {
  // Let fetch errors propagate — unstable_cache will not cache failures,
  // so the next page load retries. Only return empty for genuinely empty sheets.
  const csv = await fetchAdminHoldingSheetCsv()
  const records = parseAdminHoldingCsv(csv)

  if (records.length === 0) {
    return emptyAnalytics()
  }

  return {
    lastUpdated: new Date().toISOString(),
    dataReady: true,
    dataSource: ADMIN_HOLDING_SHEET.label,
    total: records.length,
    statusStats: buildStatusStats(records),
    records,
  }
}

export const ADMIN_HOLDING_ANALYTICS_CACHE_TAG = "admin-holding-analytics-v1"

/** Cached until manual refresh — no repeat Google Sheet fetch on revisit. */
const getCachedAdminHoldingAnalytics = unstable_cache(
  loadAdminHoldingAnalytics,
  [ADMIN_HOLDING_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [ADMIN_HOLDING_ANALYTICS_CACHE_TAG] },
)

export async function getAdminHoldingAnalytics(): Promise<AdminHoldingAnalytics> {
  return getCachedAdminHoldingAnalytics()
}

export function toAdminHoldingSummary(data: AdminHoldingAnalytics): AdminHoldingSummary {
  const { records: _records, ...summary } = data
  return summary
}
