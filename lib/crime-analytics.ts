import { unstable_cache } from "next/cache"

import { isIndexCrimeCategory, isNonIndexCrimeCategory } from "@/lib/crime-config"
import { fetchStoredCrimeAnalytics } from "@/lib/crime-records"
import type { CrimeAnalytics, CrimeCategoryStats, CrimeMonthlyCount } from "@/lib/crime-types"
import type { CountItem } from "@/lib/personnel-types"
import type { ParsedCrimeRecord } from "@/lib/crime-xlsx-parser"

export const CRIME_SUPABASE_SOURCE_LABEL = "PRO4A Crime Stats (Supabase)"

function buildCountItems(counts: Map<string, number>, total: number): CountItem[] {
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((left, right) => right.count - left.count)
}

function emptyCategoryStats(): CrimeCategoryStats {
  return {
    totalVolume: 0,
    coveredPeriodStart: null,
    coveredPeriodEnd: null,
    ppoBreakdown: [],
    crimeBreakdown: [],
    monthlyBreakdown: [],
  }
}

export function emptyCrimeAnalytics(fileName = ""): CrimeAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataSource: CRIME_SUPABASE_SOURCE_LABEL,
    dataReady: false,
    year: null,
    indexCrime: emptyCategoryStats(),
    nonIndexCrime: emptyCategoryStats(),
    categoryBreakdown: [],
  }
}

function parseCommittedDateValue(value: string | null | undefined): Date | null {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
  }

  const parts = trimmed.split("/")
  if (parts.length !== 3) return null

  const month = Number.parseInt(parts[0] ?? "", 10)
  const day = Number.parseInt(parts[1] ?? "", 10)
  let year = Number.parseInt(parts[2] ?? "", 10)

  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) {
    return null
  }

  if (year < 100) {
    year += 2000
  }

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime()) || date.getMonth() !== month - 1) {
    return null
  }

  return date
}

function formatCrimePeriodDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function getRecordMonthKey(record: ParsedCrimeRecord): string | null {
  const dateStr = record.dateCommitted || record.dateReported
  if (!dateStr) return null

  const match = dateStr.match(/^(\d{4})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}` : null
}

function formatMonthLabel(monthKey: string, spanMultipleYears: boolean) {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
  return spanMultipleYears ? `${shortMonth} ${year}` : shortMonth
}

function buildMonthlyBreakdown(
  records: ParsedCrimeRecord[],
): CrimeMonthlyCount[] {
  const monthCounts = new Map<string, number>()

  for (const record of records) {
    const monthKey = getRecordMonthKey(record)
    if (!monthKey) continue
    monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1)
  }

  const years = new Set([...monthCounts.keys()].map((key) => key.slice(0, 4)))
  const spanMultipleYears = years.size > 1

  return [...monthCounts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([monthKey, count]) => ({
      monthKey,
      label: formatMonthLabel(monthKey, spanMultipleYears),
      count,
    }))
}

function buildCategoryStats(records: ParsedCrimeRecord[], year: number | null): CrimeCategoryStats {
  const ppoCounts = new Map<string, number>()
  const crimeCounts = new Map<string, number>()
  let latestCommitted: Date | null = null

  for (const record of records) {
    ppoCounts.set(record.ppo, (ppoCounts.get(record.ppo) ?? 0) + 1)
    crimeCounts.set(record.crime, (crimeCounts.get(record.crime) ?? 0) + 1)

    const committedDate = parseCommittedDateValue(record.dateCommitted)
    if (committedDate && (!latestCommitted || committedDate > latestCommitted)) {
      latestCommitted = committedDate
    }
  }

  const totalVolume = records.length
  const coveredPeriodStart = year
    ? formatCrimePeriodDate(new Date(year, 0, 1))
    : null
  const coveredPeriodEnd = latestCommitted ? formatCrimePeriodDate(latestCommitted) : null

  return {
    totalVolume,
    coveredPeriodStart,
    coveredPeriodEnd,
    ppoBreakdown: buildCountItems(ppoCounts, totalVolume),
    crimeBreakdown: buildCountItems(crimeCounts, totalVolume),
    monthlyBreakdown: buildMonthlyBreakdown(records),
  }
}

export function buildCrimeAnalyticsFromRecords(
  records: ParsedCrimeRecord[],
  meta: { fileName: string; lastUpdated: string },
): CrimeAnalytics {
  const indexRecords = records.filter((record) => isIndexCrimeCategory(record.category))
  const nonIndexRecords = records.filter((record) => isNonIndexCrimeCategory(record.category))

  const categoryCounts = new Map<string, number>()
  let year: number | null = null

  for (const record of records) {
    if (record.category) {
      categoryCounts.set(record.category, (categoryCounts.get(record.category) ?? 0) + 1)
    }

    if (record.year != null) {
      year ??= record.year
    }
  }

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataSource: CRIME_SUPABASE_SOURCE_LABEL,
    dataReady: indexRecords.length > 0 || nonIndexRecords.length > 0,
    year,
    indexCrime: buildCategoryStats(indexRecords, year),
    nonIndexCrime: buildCategoryStats(nonIndexRecords, year),
    categoryBreakdown: buildCountItems(categoryCounts, records.length),
  }
}

async function loadCrimeAnalytics(): Promise<CrimeAnalytics> {
  try {
    const stored = await fetchStoredCrimeAnalytics()
    if (stored) return stored
  } catch {
    // fall through to empty state
  }

  return emptyCrimeAnalytics()
}

export const CRIME_ANALYTICS_CACHE_TAG = "crime-analytics-supabase-v4"

const getCachedCrimeAnalytics = unstable_cache(loadCrimeAnalytics, [CRIME_ANALYTICS_CACHE_TAG], {
  revalidate: false,
  tags: [CRIME_ANALYTICS_CACHE_TAG],
})

export async function getCrimeAnalytics(): Promise<CrimeAnalytics> {
  return getCachedCrimeAnalytics()
}
