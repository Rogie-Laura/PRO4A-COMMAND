import { unstable_cache } from "next/cache"

import { fetchStoredCrimeAnalytics } from "@/lib/crime-records"
import type { CrimeAnalytics } from "@/lib/crime-types"
import type { CountItem } from "@/lib/personnel-types"
import type { ParsedCrimeRecord } from "@/lib/crime-xlsx-parser"

export const CRIME_SUPABASE_SOURCE_LABEL = "PRO4A Crime Stats (Supabase)"

const CSV_EXPECTED_HEADERS = [
  "ppo",
  "stn",
  "barangay",
  "year",
  "typeofplace",
  "datereported",
  "datecommitted",
  "timecommitted",
  "crime",
  "category",
  "victim",
  "suspect",
  "narrative",
  "casestatus",
  "lat",
  "lng",
] as const

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

function parseCsvRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => parseCsvLine(line).map((value) => value.trim()))
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase()
}

function isCrimeDataSheet(headers: string[]) {
  const normalized = headers.map(normalizeHeader)
  return CSV_EXPECTED_HEADERS.every((header) => normalized.includes(header))
}

function buildCountItems(counts: Map<string, number>, total: number): CountItem[] {
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((left, right) => right.count - left.count)
}

export function emptyCrimeAnalytics(fileName = ""): CrimeAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataSource: CRIME_SUPABASE_SOURCE_LABEL,
    dataReady: false,
    year: null,
    totalVolume: 0,
    coveredPeriodStart: null,
    coveredPeriodEnd: null,
    ppoBreakdown: [],
    crimeBreakdown: [],
    categoryBreakdown: [],
    statusBreakdown: [],
  }
}

function parseSlashDate(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null

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

function parseCommittedDateValue(value: string | null | undefined): Date | null {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
  }

  return parseSlashDate(trimmed)
}

function formatCrimePeriodDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function buildCoveredPeriod(year: number | null, latestCommitted: Date | null) {
  if (!year) {
    return { coveredPeriodStart: null, coveredPeriodEnd: null }
  }

  const coveredPeriodStart = formatCrimePeriodDate(new Date(year, 0, 1))
  const coveredPeriodEnd = latestCommitted ? formatCrimePeriodDate(latestCommitted) : null

  return { coveredPeriodStart, coveredPeriodEnd }
}

export function buildCrimeAnalyticsFromRecords(
  records: ParsedCrimeRecord[],
  meta: { fileName: string; lastUpdated: string },
): CrimeAnalytics {
  const ppoCounts = new Map<string, number>()
  const crimeCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  let year: number | null = null
  let latestCommitted: Date | null = null

  for (const record of records) {
    ppoCounts.set(record.ppo, (ppoCounts.get(record.ppo) ?? 0) + 1)
    crimeCounts.set(record.crime, (crimeCounts.get(record.crime) ?? 0) + 1)

    if (record.category) {
      categoryCounts.set(record.category, (categoryCounts.get(record.category) ?? 0) + 1)
    }

    if (record.year != null) {
      year ??= record.year
    }

    const committedDate = parseCommittedDateValue(record.dateCommitted)
    if (committedDate && (!latestCommitted || committedDate > latestCommitted)) {
      latestCommitted = committedDate
    }
  }

  const totalVolume = records.length
  const { coveredPeriodStart, coveredPeriodEnd } = buildCoveredPeriod(year, latestCommitted)

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataSource: CRIME_SUPABASE_SOURCE_LABEL,
    dataReady: true,
    year,
    totalVolume,
    coveredPeriodStart,
    coveredPeriodEnd,
    ppoBreakdown: buildCountItems(ppoCounts, totalVolume),
    crimeBreakdown: buildCountItems(crimeCounts, totalVolume),
    categoryBreakdown: buildCountItems(categoryCounts, totalVolume),
    statusBreakdown: [],
  }
}

export function buildCrimeAnalytics(csvText: string, fileName: string): CrimeAnalytics {
  const rows = parseCsvRows(csvText)
  if (rows.length < 2) {
    return emptyCrimeAnalytics(fileName)
  }

  const headers = rows[0].map(normalizeHeader)
  if (!isCrimeDataSheet(headers)) {
    return emptyCrimeAnalytics(fileName)
  }

  const ppoIndex = headers.indexOf("ppo")
  const yearIndex = headers.indexOf("year")
  const committedIndex = headers.indexOf("datecommitted")
  const crimeIndex = headers.indexOf("crime")
  const categoryIndex = headers.indexOf("category")
  const statusIndex = headers.indexOf("casestatus")

  const ppoCounts = new Map<string, number>()
  const crimeCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  const statusCounts = new Map<string, number>()
  let year: number | null = null
  let latestCommitted: Date | null = null
  let totalVolume = 0

  for (const row of rows.slice(1)) {
    const ppo = row[ppoIndex]?.trim()
    const crime = row[crimeIndex]?.trim()
    const category = row[categoryIndex]?.trim()
    const status = row[statusIndex]?.trim()

    if (!ppo || !crime) continue

    totalVolume += 1

    const yearValue = Number.parseInt(row[yearIndex] ?? "", 10)
    if (Number.isFinite(yearValue)) {
      year ??= yearValue
    }

    const committedDate = parseSlashDate(row[committedIndex] ?? "")
    if (committedDate && (!latestCommitted || committedDate > latestCommitted)) {
      latestCommitted = committedDate
    }

    ppoCounts.set(ppo, (ppoCounts.get(ppo) ?? 0) + 1)
    crimeCounts.set(crime, (crimeCounts.get(crime) ?? 0) + 1)

    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    }

    if (status) {
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    }
  }

  if (totalVolume === 0) {
    return emptyCrimeAnalytics(fileName)
  }

  const { coveredPeriodStart, coveredPeriodEnd } = buildCoveredPeriod(year, latestCommitted)

  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataSource: "PNP-CIRAS CSV",
    dataReady: true,
    year,
    totalVolume,
    coveredPeriodStart,
    coveredPeriodEnd,
    ppoBreakdown: buildCountItems(ppoCounts, totalVolume),
    crimeBreakdown: buildCountItems(crimeCounts, totalVolume),
    categoryBreakdown: buildCountItems(categoryCounts, totalVolume),
    statusBreakdown: buildCountItems(statusCounts, totalVolume),
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

export const CRIME_ANALYTICS_CACHE_TAG = "crime-analytics-supabase-v2"

const getCachedCrimeAnalytics = unstable_cache(loadCrimeAnalytics, [CRIME_ANALYTICS_CACHE_TAG], {
  revalidate: false,
  tags: [CRIME_ANALYTICS_CACHE_TAG],
})

export async function getCrimeAnalytics(): Promise<CrimeAnalytics> {
  return getCachedCrimeAnalytics()
}
