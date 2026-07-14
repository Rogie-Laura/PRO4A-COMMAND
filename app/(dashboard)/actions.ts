"use server"

import { updateTag } from "next/cache"

import { ADMIN_HOLDING_ANALYTICS_CACHE_TAG, getAdminHoldingAnalytics } from "@/lib/admin-holding-analytics"
import type { AdminHoldingRecord } from "@/lib/admin-holding-types"
import {
  getDetailedNhqAnalytics,
  getDetailedNosusAnalytics,
  getDetailedRhqPpoAnalytics,
  getDetailedRsuAnalytics,
  getDetailedPersonnelDashboard,
  DETAILED_PERSONNEL_CACHE_TAGS,
} from "@/lib/detailed-personnel-analytics"
import {
  buildDetailedPersonnelStatusSummary,
  type DetailedPersonnelRecordWithSource,
} from "@/lib/detailed-personnel-status"
import type { DetailedPersonnelRecord, DetailedPersonnelTabKey } from "@/lib/detailed-personnel-types"
import { buildRankTenurePersonnelForBracket, mapPersonnelRow } from "@/lib/personnel-aggregations"
import { fetchPersonnelSheetCsv, parseCsv, PERSONNEL_RECAP_CSV_CACHE_TAG } from "@/lib/google-sheets"
import { getPersonnelAnalytics, PERSONNEL_ANALYTICS_CACHE_TAG } from "@/lib/personnel-analytics"
import { getRprmdWorkbookPayload, RPRMD_WORKBOOK_CACHE_TAG } from "@/lib/rprmd-workbook-records"
import {
  getSchoolingMandatoryAnalytics,
  getSchoolingMandatorySummary,
  getSchoolingSpecializedAnalytics,
  getSchoolingSpecializedSummary,
  SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG,
  SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG,
} from "@/lib/schooling-analytics"
import type { SchoolingAnalytics, SchoolingTabKey } from "@/lib/schooling-types"
import type { RankTenurePersonDetail, StationBreakdownItem } from "@/lib/personnel-types"

export async function fetchSchoolingBreakdown(tab: SchoolingTabKey): Promise<SchoolingAnalytics> {
  if (tab === "mandatory") {
    return getSchoolingMandatoryAnalytics()
  }

  return getSchoolingSpecializedAnalytics()
}

export async function fetchSchoolingDashboardSummaries() {
  const mandatory = await getSchoolingMandatorySummary()
  const specialized = await getSchoolingSpecializedSummary()
  return { mandatory, specialized }
}

export async function fetchDetailedPersonnelDashboard() {
  return getDetailedPersonnelDashboard()
}

export async function fetchDetailedPersonnelTab(
  tab: DetailedPersonnelTabKey,
): Promise<DetailedPersonnelRecord[]> {
  const data = await ({
    nhq: getDetailedNhqAnalytics,
    nosus: getDetailedNosusAnalytics,
    rsu: getDetailedRsuAnalytics,
    rhqPpo: getDetailedRhqPpoAnalytics,
  })[tab]()

  return data.records
}

export async function fetchDetailedPersonnelStatusRecords(
  type: "expiring" | "terminated",
): Promise<DetailedPersonnelRecordWithSource[]> {
  const [nhq, nosus, rsu, rhqPpo] = await Promise.all([
    getDetailedNhqAnalytics(),
    getDetailedNosusAnalytics(),
    getDetailedRsuAnalytics(),
    getDetailedRhqPpoAnalytics(),
  ])

  const summary = buildDetailedPersonnelStatusSummary(nhq, nosus, rsu, rhqPpo)
  return type === "expiring" ? summary.expiringRecords : summary.terminatedRecords
}

export async function fetchAdminHoldingRecords(status: string): Promise<AdminHoldingRecord[]> {
  const data = await getAdminHoldingAnalytics()
  return data.records.filter((record) => record.status === status)
}

export async function fetchOfficeStations(subUnit: string): Promise<StationBreakdownItem[]> {
  const data = await getPersonnelAnalytics()
  const office = data.officeBreakdown.find((item) => item.subUnit === subUnit)
  return office?.stations ?? []
}

export async function fetchRankTenurePersonnel(
  rank: string,
  bracketId: string,
): Promise<RankTenurePersonDetail[]> {
  const data = await getPersonnelAnalytics()
  const row = data.rankTenureDistribution.find((item) => item.rank === rank)
  const cached = row?.bracketDetails[bracketId]
  if (cached && cached.length > 0) return cached

  const uploaded = await getRprmdWorkbookPayload()
  if (uploaded?.personnelRecords?.length) {
    return buildRankTenurePersonnelForBracket(uploaded.personnelRecords, rank, bracketId)
  }

  const csv = await fetchPersonnelSheetCsv()
  const rows = parseCsv(csv)
  const records = rows.map(mapPersonnelRow).filter((record) => record.lastName || record.firstName)
  return buildRankTenurePersonnelForBracket(records, rank, bracketId)
}

export async function refreshPersonnelStatsData() {
  updateTag(RPRMD_WORKBOOK_CACHE_TAG)
  updateTag(PERSONNEL_RECAP_CSV_CACHE_TAG)
  updateTag(PERSONNEL_ANALYTICS_CACHE_TAG)
  updateTag(ADMIN_HOLDING_ANALYTICS_CACHE_TAG)
  updateTag(SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG)
  updateTag(SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG)
  for (const tag of DETAILED_PERSONNEL_CACHE_TAGS) {
    updateTag(tag)
  }
}
