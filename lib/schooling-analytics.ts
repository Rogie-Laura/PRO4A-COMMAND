import { unstable_cache } from "next/cache"

import {
  fetchSchoolingMandatorySheetCsv,
  fetchSchoolingSpecializedSheetCsv,
  parseCsvRows,
} from "@/lib/google-sheets"
import { SCHOOLING_SHEET } from "@/lib/schooling-sheet"
import type { SchoolingAnalytics, SchoolingRecord, SchoolingSummary } from "@/lib/schooling-types"
import type { CountItem } from "@/lib/personnel-types"

function emptyAnalytics(title: string, dataSource: string): SchoolingAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource,
    title,
    total: 0,
    subUnitStats: [],
    courseStats: [],
    records: [],
  }
}

export function extractSchoolingCourse(courseSchool: string): string {
  const trimmed = courseSchool.trim()
  if (!trimmed) return "Unspecified"

  const slashIndex = trimmed.indexOf("/")
  const label = slashIndex >= 0 ? trimmed.slice(0, slashIndex) : trimmed

  return label.trim() || "Unspecified"
}

function isSchoolingDataRow(cols: string[]) {
  const no = cols[0]?.trim() ?? ""
  const rank = cols[1]?.trim() ?? ""
  const lastName = cols[2]?.trim() ?? ""

  if (rank.toUpperCase() === "RANK" || lastName.toUpperCase() === "LAST NAME") return false
  return /^\d+$/.test(no) && rank.length > 0 && lastName.length > 0
}

function mapSchoolingRow(cols: string[]): SchoolingRecord {
  return {
    no: Number.parseInt(cols[0] ?? "0", 10),
    rank: cols[1]?.trim() ?? "",
    lastName: cols[2]?.trim() ?? "",
    firstName: cols[3]?.trim() ?? "",
    middleName: cols[4]?.trim() ?? "",
    qlfr: cols[5]?.trim() ?? "",
    badgeNumber: cols[6]?.trim() ?? "",
    subUnit: cols[7]?.trim() || "Unspecified",
    unitOffice: cols[8]?.trim() ?? "",
    effectiveDate: cols[9]?.trim() ?? "",
    course: extractSchoolingCourse(cols[10]?.trim() ?? ""),
    courseSchool: cols[10]?.trim() ?? "",
    authority: cols[11]?.trim() ?? "",
  }
}

function buildCourseStats(records: SchoolingRecord[]): CountItem[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    counts.set(record.course, (counts.get(record.course) ?? 0) + 1)
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

function buildSubUnitStats(records: SchoolingRecord[]): CountItem[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    counts.set(record.subUnit, (counts.get(record.subUnit) ?? 0) + 1)
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

export function toSchoolingSummary(data: SchoolingAnalytics): SchoolingSummary {
  return {
    lastUpdated: data.lastUpdated,
    dataReady: data.dataReady,
    dataSource: data.dataSource,
    title: data.title,
    total: data.total,
    subUnitStats: data.subUnitStats ?? [],
    courseStats: data.courseStats ?? [],
  }
}

export function parseSchoolingCsv(text: string): SchoolingRecord[] {
  const rows = parseCsvRows(text)
  return rows.filter(isSchoolingDataRow).map(mapSchoolingRow)
}

async function loadSchoolingMandatoryAnalytics(): Promise<SchoolingAnalytics> {
  try {
    const csv = await fetchSchoolingMandatorySheetCsv()
    const records = parseSchoolingCsv(csv)

    if (records.length === 0) {
      return emptyAnalytics(SCHOOLING_SHEET.mandatoryLabel, SCHOOLING_SHEET.mandatoryLabel)
    }

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: SCHOOLING_SHEET.mandatoryLabel,
      title: SCHOOLING_SHEET.mandatoryLabel,
      total: records.length,
      subUnitStats: buildSubUnitStats(records),
      courseStats: buildCourseStats(records),
      records,
    }
  } catch {
    return emptyAnalytics(SCHOOLING_SHEET.mandatoryLabel, SCHOOLING_SHEET.mandatoryLabel)
  }
}

async function loadSchoolingSpecializedAnalytics(): Promise<SchoolingAnalytics> {
  try {
    const csv = await fetchSchoolingSpecializedSheetCsv()
    const records = parseSchoolingCsv(csv)

    if (records.length === 0) {
      return emptyAnalytics(SCHOOLING_SHEET.specializedLabel, SCHOOLING_SHEET.specializedLabel)
    }

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: SCHOOLING_SHEET.specializedLabel,
      title: SCHOOLING_SHEET.specializedLabel,
      total: records.length,
      subUnitStats: buildSubUnitStats(records),
      courseStats: buildCourseStats(records),
      records,
    }
  } catch {
    return emptyAnalytics(SCHOOLING_SHEET.specializedLabel, SCHOOLING_SHEET.specializedLabel)
  }
}

export const SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG = "schooling-mandatory-analytics-v2"
export const SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG = "schooling-specialized-analytics-v2"

const getCachedSchoolingMandatoryAnalytics = unstable_cache(
  loadSchoolingMandatoryAnalytics,
  [SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG] },
)

const getCachedSchoolingSpecializedAnalytics = unstable_cache(
  loadSchoolingSpecializedAnalytics,
  [SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG] },
)

export async function getSchoolingMandatoryAnalytics(): Promise<SchoolingAnalytics> {
  return getCachedSchoolingMandatoryAnalytics()
}

export async function getSchoolingSpecializedAnalytics(): Promise<SchoolingAnalytics> {
  return getCachedSchoolingSpecializedAnalytics()
}
