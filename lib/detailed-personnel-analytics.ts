import { unstable_cache } from "next/cache"

import { DETAILED_PERSONNEL_SHEET } from "@/lib/detailed-personnel-sheet"
import type {
  DetailedPersonnelAnalytics,
  DetailedPersonnelRecord,
  DetailedPersonnelTabKey,
} from "@/lib/detailed-personnel-types"
import { fetchDetailedPersonnelSheetCsv, parseCsvRows } from "@/lib/google-sheets"

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

async function loadDetailedPersonnelAnalytics(
  tab: DetailedPersonnelTabKey,
): Promise<DetailedPersonnelAnalytics> {
  const { label } = DETAILED_PERSONNEL_SHEET.tabs[tab]

  try {
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
  } catch {
    return emptyAnalytics(label)
  }
}

export const DETAILED_NHQ_ANALYTICS_CACHE_TAG = "detailed-nhq-analytics-v1"
export const DETAILED_NOSUS_ANALYTICS_CACHE_TAG = "detailed-nosus-analytics-v1"
export const DETAILED_RSU_ANALYTICS_CACHE_TAG = "detailed-rsu-analytics-v1"
export const DETAILED_RHQ_PPO_ANALYTICS_CACHE_TAG = "detailed-rhq-ppo-analytics-v1"

const CACHE_BY_TAB: Record<
  DetailedPersonnelTabKey,
  { tag: string; getter: () => Promise<DetailedPersonnelAnalytics> }
> = {
  nhq: {
    tag: DETAILED_NHQ_ANALYTICS_CACHE_TAG,
    getter: unstable_cache(
      () => loadDetailedPersonnelAnalytics("nhq"),
      [DETAILED_NHQ_ANALYTICS_CACHE_TAG],
      { revalidate: false, tags: [DETAILED_NHQ_ANALYTICS_CACHE_TAG] },
    ),
  },
  nosus: {
    tag: DETAILED_NOSUS_ANALYTICS_CACHE_TAG,
    getter: unstable_cache(
      () => loadDetailedPersonnelAnalytics("nosus"),
      [DETAILED_NOSUS_ANALYTICS_CACHE_TAG],
      { revalidate: false, tags: [DETAILED_NOSUS_ANALYTICS_CACHE_TAG] },
    ),
  },
  rsu: {
    tag: DETAILED_RSU_ANALYTICS_CACHE_TAG,
    getter: unstable_cache(
      () => loadDetailedPersonnelAnalytics("rsu"),
      [DETAILED_RSU_ANALYTICS_CACHE_TAG],
      { revalidate: false, tags: [DETAILED_RSU_ANALYTICS_CACHE_TAG] },
    ),
  },
  rhqPpo: {
    tag: DETAILED_RHQ_PPO_ANALYTICS_CACHE_TAG,
    getter: unstable_cache(
      () => loadDetailedPersonnelAnalytics("rhqPpo"),
      [DETAILED_RHQ_PPO_ANALYTICS_CACHE_TAG],
      { revalidate: false, tags: [DETAILED_RHQ_PPO_ANALYTICS_CACHE_TAG] },
    ),
  },
}

export async function getDetailedNhqAnalytics() {
  return CACHE_BY_TAB.nhq.getter()
}

export async function getDetailedNosusAnalytics() {
  return CACHE_BY_TAB.nosus.getter()
}

export async function getDetailedRsuAnalytics() {
  return CACHE_BY_TAB.rsu.getter()
}

export async function getDetailedRhqPpoAnalytics() {
  return CACHE_BY_TAB.rhqPpo.getter()
}

export const DETAILED_PERSONNEL_CACHE_TAGS = Object.values(CACHE_BY_TAB).map((entry) => entry.tag)
