import { unstable_cache } from "next/cache"

import { DETAILED_PERSONNEL_SHEET } from "@/lib/detailed-personnel-sheet"
import {
  isExpiringDetailedOrder,
  isTerminatedDetailedOrder,
  type DetailedPersonnelStatusCounts,
} from "@/lib/detailed-personnel-status"
import type {
  DetailedPersonnelAnalytics,
  DetailedPersonnelRecord,
  DetailedPersonnelSummary,
  DetailedPersonnelTabKey,
} from "@/lib/detailed-personnel-types"
import { fetchDetailedPersonnelSheetCsv, parseCsvRows } from "@/lib/google-sheets"

export type DetailedPersonnelDashboardData = {
  nhq: DetailedPersonnelSummary
  nosus: DetailedPersonnelSummary
  rsu: DetailedPersonnelSummary
  rhqPpo: DetailedPersonnelSummary
  status: DetailedPersonnelStatusCounts
}

function emptyAnalytics(title: string): DetailedPersonnelAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: title,
    title,
    total: 0,
    records: [],
  }
}

function isDetailedPersonnelDataRow(cols: string[]) {
  const no = cols[0]?.trim() ?? ""
  const rank = cols[1]?.trim() ?? ""
  const lastName = cols[2]?.trim() ?? ""

  if (rank.toUpperCase() === "RANK" || lastName.toUpperCase() === "LAST NAME") return false
  if (rank.toUpperCase() === "OFFICE") return false
  return /^\d+$/.test(no) && rank.length > 0 && lastName.length > 0
}

function mapDetailedPersonnelRow(cols: string[]): DetailedPersonnelRecord {
  return {
    no: Number.parseInt(cols[0] ?? "0", 10),
    rank: cols[1]?.trim() ?? "",
    lastName: cols[2]?.trim() ?? "",
    firstName: cols[3]?.trim() ?? "",
    middleName: cols[4]?.trim() ?? "",
    qlfr: cols[5]?.trim() ?? "",
    badgeNumber: cols[6]?.trim() ?? "",
    designation: cols[7]?.trim() ?? "",
    effDate: cols[8]?.trim() ?? "",
    endDate: cols[9]?.trim() ?? "",
    unitFrom: cols[10]?.trim() || "Unspecified",
    unitTo: cols[11]?.trim() ?? "",
    authority: cols[12]?.trim() ?? "",
    daysRemaining: cols[13]?.trim() ?? "",
  }
}

export function parseDetailedPersonnelCsv(text: string): DetailedPersonnelRecord[] {
  const rows = parseCsvRows(text)
  return rows.filter(isDetailedPersonnelDataRow).map(mapDetailedPersonnelRow)
}

export function toDetailedPersonnelSummary(
  data: DetailedPersonnelAnalytics,
): DetailedPersonnelSummary {
  return {
    lastUpdated: data.lastUpdated,
    dataReady: data.dataReady,
    dataSource: data.dataSource,
    title: data.title,
    total: data.total,
  }
}

function buildSummary(label: string, records: DetailedPersonnelRecord[]): DetailedPersonnelSummary {
  if (records.length === 0) {
    return toDetailedPersonnelSummary(emptyAnalytics(label))
  }

  return {
    lastUpdated: new Date().toISOString(),
    dataReady: true,
    dataSource: label,
    title: label,
    total: records.length,
  }
}

async function loadDetailedPersonnelAnalytics(
  tab: DetailedPersonnelTabKey,
): Promise<DetailedPersonnelAnalytics> {
  const { label } = DETAILED_PERSONNEL_SHEET.tabs[tab]
  const csv = await fetchDetailedPersonnelSheetCsv(tab)
  const records = parseDetailedPersonnelCsv(csv)

  if (records.length === 0) {
    return emptyAnalytics(label)
  }

  return {
    lastUpdated: new Date().toISOString(),
    dataReady: true,
    dataSource: label,
    title: label,
    total: records.length,
    records,
  }
}

/** Loads all detailed tabs sequentially to avoid Google CSV export throttling. */
async function loadDetailedPersonnelDashboard(): Promise<DetailedPersonnelDashboardData> {
  const tabs: DetailedPersonnelTabKey[] = ["nhq", "nosus", "rsu", "rhqPpo"]
  const summaries = {} as Record<DetailedPersonnelTabKey, DetailedPersonnelSummary>
  let terminatedCount = 0
  let expiringCount = 0

  for (const tab of tabs) {
    const { label } = DETAILED_PERSONNEL_SHEET.tabs[tab]
    const csv = await fetchDetailedPersonnelSheetCsv(tab)
    const records = parseDetailedPersonnelCsv(csv)
    summaries[tab] = buildSummary(label, records)

    for (const record of records) {
      if (isTerminatedDetailedOrder(record)) {
        terminatedCount += 1
      } else if (isExpiringDetailedOrder(record)) {
        expiringCount += 1
      }
    }
  }

  return {
    nhq: summaries.nhq,
    nosus: summaries.nosus,
    rsu: summaries.rsu,
    rhqPpo: summaries.rhqPpo,
    status: { terminatedCount, expiringCount },
  }
}

export const DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG = "detailed-personnel-dashboard-v3"

/** @deprecated Use DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG */
export const DETAILED_NHQ_ANALYTICS_CACHE_TAG = DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG
/** @deprecated Use DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG */
export const DETAILED_NOSUS_ANALYTICS_CACHE_TAG = DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG
/** @deprecated Use DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG */
export const DETAILED_RSU_ANALYTICS_CACHE_TAG = DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG
/** @deprecated Use DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG */
export const DETAILED_RHQ_PPO_ANALYTICS_CACHE_TAG = DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG

export const DETAILED_PERSONNEL_CACHE_TAGS = [DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG]

const getCachedDetailedPersonnelDashboard = unstable_cache(
  loadDetailedPersonnelDashboard,
  [DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG],
  { revalidate: false, tags: [DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG] },
)

export async function getDetailedPersonnelDashboard(): Promise<DetailedPersonnelDashboardData> {
  return getCachedDetailedPersonnelDashboard()
}

/** Full tab data with records — used by drill-down server actions (not cached). */
export async function getDetailedNhqAnalytics() {
  return loadDetailedPersonnelAnalytics("nhq")
}

export async function getDetailedNosusAnalytics() {
  return loadDetailedPersonnelAnalytics("nosus")
}

export async function getDetailedRsuAnalytics() {
  return loadDetailedPersonnelAnalytics("rsu")
}

export async function getDetailedRhqPpoAnalytics() {
  return loadDetailedPersonnelAnalytics("rhqPpo")
}
