import { buildCrimeAnalyticsFromRecords } from "@/lib/crime-analytics"
import {
  crimeNamesMatch,
  INDEX_FOCUS_CRIME_ALWAYS,
  isIndexCrimeCategory,
  normalizeCrimeName,
} from "@/lib/crime-config"
import {
  buildComparativeResult,
  buildCountChangeMetrics,
  type CrimeComparativeResult,
  type CrimeFocusComparativeRow,
  type CrimePeriodRange,
  type CrimePeriodSnapshot,
} from "@/lib/crime-comparative"
import { getEffectiveCrimeDate, isIsoDateInRange } from "@/lib/crime-dates"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CrimeAnalytics } from "@/lib/crime-types"
import type { CountItem } from "@/lib/personnel-types"
import type { ParsedCrimeRecord } from "@/lib/crime-xlsx-parser"
import { unstable_cache } from "next/cache"

const INSERT_CHUNK_SIZE = 1000
const FETCH_PAGE_SIZE = 1000
const CRIME_COMPARE_CACHE_TAG = "crime-analytics-supabase-v6"

export type CrimeUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  recordCount: number
  createdAt: string
}

type ReplaceCrimeRecordsInput = {
  filename: string
  uploadedByLabel: string
  records: ParsedCrimeRecord[]
}

export type ReplaceCrimeRecordsResult = {
  batch: CrimeUploadBatchInfo
  insertedCount: number
  analytics: CrimeAnalytics
}

type StoredCrimeBatchRow = {
  id: string
  filename: string
  uploaded_by_label: string | null
  record_count: number
  created_at: string
  analytics: unknown
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  record_count: number
  created_at: string
}): CrimeUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    recordCount: row.record_count,
    createdAt: row.created_at,
  }
}

function toInsertRow(batchId: string, record: ParsedCrimeRecord) {
  return {
    batch_id: batchId,
    ppo: record.ppo,
    stn: record.stn,
    barangay: record.barangay,
    year: record.year,
    typeof_place: record.typeofPlace,
    date_reported: record.dateReported,
    date_committed: record.dateCommitted,
    time_committed: record.timeCommitted,
    crime: record.crime,
    category: record.category,
  }
}

function mapStoredRecord(row: {
  ppo: string
  stn: string
  barangay: string
  year: number | null
  typeof_place: string
  date_reported: string | null
  date_committed: string | null
  time_committed: string
  crime: string
  category: string
}): ParsedCrimeRecord {
  return {
    ppo: row.ppo,
    stn: row.stn,
    barangay: row.barangay,
    year: row.year,
    typeofPlace: row.typeof_place,
    dateReported: row.date_reported,
    dateCommitted: row.date_committed,
    timeCommitted: row.time_committed,
    crime: row.crime,
    category: row.category ?? "",
  }
}

function hasCurrentAnalyticsShape(analytics: unknown): analytics is CrimeAnalytics {
  if (!analytics || typeof analytics !== "object") return false

  const value = analytics as Partial<CrimeAnalytics>
  return Boolean(
    value.dataReady &&
      value.indexCrime &&
      value.nonIndexCrime &&
      Array.isArray(value.indexCrime.ppoBreakdown) &&
      Array.isArray(value.nonIndexCrime.ppoBreakdown) &&
      value.indexCrime.unitBreakdownByPpo &&
      typeof value.indexCrime.unitBreakdownByPpo === "object",
  )
}

function normalizeStoredAnalytics(
  analytics: CrimeAnalytics,
  batch: { filename: string; created_at: string },
): CrimeAnalytics {
  return {
    ...analytics,
    fileName: analytics.fileName || batch.filename,
    lastUpdated: analytics.lastUpdated || batch.created_at,
    categoryBreakdown: analytics.categoryBreakdown ?? [],
    indexCrime: {
      ...analytics.indexCrime,
      unitBreakdownByPpo: analytics.indexCrime.unitBreakdownByPpo ?? {},
      focusCrimeCatalog:
        analytics.indexCrime.focusCrimeCatalog ??
        buildFocusCrimeCatalogFromBreakdown(analytics.indexCrime.crimeBreakdown ?? []),
    },
    nonIndexCrime: {
      ...analytics.nonIndexCrime,
      unitBreakdownByPpo: analytics.nonIndexCrime.unitBreakdownByPpo ?? {},
    },
  }
}

async function getLatestStoredCrimeBatch(): Promise<StoredCrimeBatchRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crime_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function fetchCrimeRecordsForBatch(batchId: string): Promise<ParsedCrimeRecord[]> {
  const supabase = createAdminClient()
  const records: ParsedCrimeRecord[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("crime_records")
      .select(
        "ppo, stn, barangay, year, typeof_place, date_reported, date_committed, time_committed, crime, category",
      )
      .eq("batch_id", batchId)
      .order("id", { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      break
    }

    records.push(...data.map(mapStoredRecord))

    if (data.length < FETCH_PAGE_SIZE) {
      break
    }

    from += FETCH_PAGE_SIZE
  }

  return records
}

async function persistBatchAnalytics(batchId: string, analytics: CrimeAnalytics) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("crime_upload_batches")
    .update({ analytics })
    .eq("id", batchId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getLatestCrimeUploadBatch(): Promise<CrimeUploadBatchInfo | null> {
  const batch = await getLatestStoredCrimeBatch()
  return batch ? mapBatch(batch) : null
}

export async function fetchStoredCrimeAnalytics(): Promise<CrimeAnalytics | null> {
  const batch = await getLatestStoredCrimeBatch()
  if (!batch) return null

  if (hasCurrentAnalyticsShape(batch.analytics)) {
    return normalizeStoredAnalytics(batch.analytics, batch)
  }

  const records = await fetchCrimeRecordsForBatch(batch.id)
  if (records.length === 0) {
    return null
  }

  const rebuilt = buildCrimeAnalyticsFromRecords(records, {
    fileName: batch.filename,
    lastUpdated: batch.created_at,
  })

  if (!rebuilt.dataReady) {
    return null
  }

  try {
    await persistBatchAnalytics(batch.id, rebuilt)
  } catch {
    // Still serve rebuilt analytics even if cache write fails.
  }

  return rebuilt
}

type IndexCrimeRangeRow = {
  ppo: string
  crime: string
  category: string
  dateCommitted: string | null
  dateReported: string | null
}

function buildPpoBreakdown(counts: Map<string, number>, total: number): CountItem[] {
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((left, right) => right.count - left.count)
}

function mapRangeRow(row: {
  ppo: string
  crime: string
  category: string
  date_committed: string | null
  date_reported: string | null
}): IndexCrimeRangeRow {
  return {
    ppo: row.ppo,
    crime: row.crime,
    category: row.category ?? "",
    dateCommitted: row.date_committed,
    dateReported: row.date_reported,
  }
}

function buildFocusCrimeCatalogFromBreakdown(breakdown: CountItem[]): string[] {
  const crimes = new Map<string, string>()

  for (const always of INDEX_FOCUS_CRIME_ALWAYS) {
    const normalized = normalizeCrimeName(always)
    crimes.set(normalized.toUpperCase(), normalized)
  }

  for (const item of breakdown) {
    const normalized = normalizeCrimeName(item.name)
    if (!normalized) continue
    crimes.set(normalized.toUpperCase(), normalized)
  }

  return [...crimes.values()].sort((left, right) => left.localeCompare(right))
}

async function fetchIndexCrimeRowsForRangeQuery(
  batchId: string,
  startIso: string,
  endIso: string,
  options?: { ppo?: string },
): Promise<IndexCrimeRangeRow[]> {
  const supabase = createAdminClient()
  const rows: IndexCrimeRangeRow[] = []
  let from = 0
  const dateOrFilter = `and(date_committed.gte.${startIso},date_committed.lte.${endIso}),and(date_committed.is.null,date_reported.gte.${startIso},date_reported.lte.${endIso})`

  while (true) {
    let query = supabase
      .from("crime_records")
      .select("ppo, crime, category, date_committed, date_reported")
      .eq("batch_id", batchId)
      .ilike("category", "INDEX")
      .or(dateOrFilter)

    if (options?.ppo) {
      query = query.eq("ppo", options.ppo.trim())
    }

    const { data, error } = await query.order("id", { ascending: true }).range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      break
    }

    rows.push(...data.map(mapRangeRow))

    if (data.length < FETCH_PAGE_SIZE) {
      break
    }

    from += FETCH_PAGE_SIZE
  }

  return rows
}

function summarizeIndexCrimeRows(
  rows: IndexCrimeRangeRow[],
  range: CrimePeriodRange,
): CrimePeriodSnapshot {
  const ppoCounts = new Map<string, number>()
  let totalVolume = 0

  for (const row of rows) {
    if (!isIndexCrimeCategory(row.category)) continue

    const effectiveDate = getEffectiveCrimeDate(row.dateCommitted, row.dateReported)
    if (!effectiveDate || !isIsoDateInRange(effectiveDate, range.start, range.end)) {
      continue
    }

    ppoCounts.set(row.ppo, (ppoCounts.get(row.ppo) ?? 0) + 1)
    totalVolume += 1
  }

  return {
    ...range,
    totalVolume,
    ppoBreakdown: buildPpoBreakdown(ppoCounts, totalVolume),
  }
}

export async function fetchIndexCrimePeriodSnapshot(
  range: CrimePeriodRange,
): Promise<CrimePeriodSnapshot> {
  const batch = await getLatestStoredCrimeBatch()
  if (!batch) {
    return { ...range, totalVolume: 0, ppoBreakdown: [] }
  }

  const rows = await fetchIndexCrimeRowsForRangeQuery(batch.id, range.start, range.end)
  return summarizeIndexCrimeRows(rows, range)
}

async function fetchIndexFocusCrimeCatalogForBatch(batch: StoredCrimeBatchRow): Promise<string[]> {
  if (hasCurrentAnalyticsShape(batch.analytics)) {
    const analytics = normalizeStoredAnalytics(batch.analytics, batch)
    if (analytics.indexCrime.focusCrimeCatalog?.length) {
      return analytics.indexCrime.focusCrimeCatalog
    }
    return buildFocusCrimeCatalogFromBreakdown(analytics.indexCrime.crimeBreakdown)
  }

  const crimes = new Map<string, string>()
  for (const always of INDEX_FOCUS_CRIME_ALWAYS) {
    const normalized = normalizeCrimeName(always)
    crimes.set(normalized.toUpperCase(), normalized)
  }

  let from = 0
  const supabase = createAdminClient()

  while (true) {
    const { data, error } = await supabase
      .from("crime_records")
      .select("crime")
      .eq("batch_id", batch.id)
      .ilike("category", "INDEX")
      .order("id", { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      break
    }

    for (const row of data) {
      const normalized = normalizeCrimeName(row.crime ?? "")
      if (!normalized) continue
      crimes.set(normalized.toUpperCase(), normalized)
    }

    if (data.length < FETCH_PAGE_SIZE) {
      break
    }

    from += FETCH_PAGE_SIZE
  }

  return [...crimes.values()].sort((left, right) => left.localeCompare(right))
}

function getCrimeCount(counts: Map<string, number>, crimeName: string) {
  for (const [name, count] of counts) {
    if (crimeNamesMatch(name, crimeName)) {
      return count
    }
  }
  return 0
}

function emptyFocusCrimeComparisonRows(): CrimeFocusComparativeRow[] {
  return INDEX_FOCUS_CRIME_ALWAYS.map((crime) => ({
    crime,
    periodA: 0,
    periodB: 0,
    change: 0,
    changePct: null,
    changeDirection: "flat" as const,
  }))
}

function buildFocusCrimeComparisonRows(
  catalog: string[],
  countsA: Map<string, number>,
  countsB: Map<string, number>,
): CrimeFocusComparativeRow[] {
  return catalog
    .map((crime) => {
      const periodACount = getCrimeCount(countsA, crime)
      const periodBCount = getCrimeCount(countsB, crime)
      const metrics = buildCountChangeMetrics(periodACount, periodBCount)

      return {
        crime,
        periodA: periodACount,
        periodB: periodBCount,
        ...metrics,
      }
    })
    .sort(
      (left, right) =>
        right.periodB - left.periodB ||
        right.periodA - left.periodA ||
        left.crime.localeCompare(right.crime),
    )
}

function summarizeIndexCrimeCrimeCounts(
  rows: IndexCrimeRangeRow[],
  range: CrimePeriodRange,
): Map<string, number> {
  const crimeCounts = new Map<string, number>()

  for (const row of rows) {
    if (!isIndexCrimeCategory(row.category)) continue

    const effectiveDate = getEffectiveCrimeDate(row.dateCommitted, row.dateReported)
    if (!effectiveDate || !isIsoDateInRange(effectiveDate, range.start, range.end)) {
      continue
    }

    const crimeName = normalizeCrimeName(row.crime) || "Unknown"
    crimeCounts.set(crimeName, (crimeCounts.get(crimeName) ?? 0) + 1)
  }

  return crimeCounts
}

function summarizeIndexCrimeCrimeCountsForPpo(
  rows: IndexCrimeRangeRow[],
  ppoCsvName: string,
  range: CrimePeriodRange,
): Map<string, number> {
  const ppoKey = ppoCsvName.trim().toUpperCase()
  const crimeCounts = new Map<string, number>()

  for (const row of rows) {
    if (!isIndexCrimeCategory(row.category)) continue
    if (row.ppo.trim().toUpperCase() !== ppoKey) continue

    const effectiveDate = getEffectiveCrimeDate(row.dateCommitted, row.dateReported)
    if (!effectiveDate || !isIsoDateInRange(effectiveDate, range.start, range.end)) {
      continue
    }

    const crimeName = normalizeCrimeName(row.crime) || "Unknown"
    crimeCounts.set(crimeName, (crimeCounts.get(crimeName) ?? 0) + 1)
  }

  return crimeCounts
}

async function fetchIndexCrimeCrimeCountsForPpoPeriod(
  batchId: string,
  ppoCsvName: string,
  range: CrimePeriodRange,
): Promise<Map<string, number>> {
  const rows = await fetchIndexCrimeRowsForRangeQuery(batchId, range.start, range.end, {
    ppo: ppoCsvName,
  })

  return summarizeIndexCrimeCrimeCountsForPpo(rows, ppoCsvName, range)
}

async function fetchIndexFocusCrimeCatalogByBatchId(batchId: string): Promise<string[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crime_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at, analytics")
    .eq("id", batchId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return buildFocusCrimeCatalogFromBreakdown([])
  }

  return fetchIndexFocusCrimeCatalogForBatch(data as StoredCrimeBatchRow)
}

async function loadPpoCrimeTypeComparison(
  batchId: string,
  ppoCsvName: string,
  periodAStart: string,
  periodAEnd: string,
  periodBStart: string,
  periodBEnd: string,
): Promise<CrimeFocusComparativeRow[]> {
  const periodA: CrimePeriodRange = {
    start: periodAStart,
    end: periodAEnd,
    label: "",
  }
  const periodB: CrimePeriodRange = {
    start: periodBStart,
    end: periodBEnd,
    label: "",
  }

  const [catalog, countsA, countsB] = await Promise.all([
    fetchIndexFocusCrimeCatalogByBatchId(batchId),
    fetchIndexCrimeCrimeCountsForPpoPeriod(batchId, ppoCsvName, periodA),
    fetchIndexCrimeCrimeCountsForPpoPeriod(batchId, ppoCsvName, periodB),
  ])

  return buildFocusCrimeComparisonRows(catalog, countsA, countsB)
}

const getCachedPpoCrimeTypeComparison = unstable_cache(
  loadPpoCrimeTypeComparison,
  ["crime-ppo-profile-v1"],
  {
    revalidate: false,
    tags: [CRIME_COMPARE_CACHE_TAG],
  },
)

async function loadRegionalCrimeTypeComparison(
  batchId: string,
  periodAStart: string,
  periodAEnd: string,
  periodBStart: string,
  periodBEnd: string,
): Promise<CrimeFocusComparativeRow[]> {
  const periodA: CrimePeriodRange = {
    start: periodAStart,
    end: periodAEnd,
    label: "",
  }
  const periodB: CrimePeriodRange = {
    start: periodBStart,
    end: periodBEnd,
    label: "",
  }

  const [catalog, rowsA, rowsB] = await Promise.all([
    fetchIndexFocusCrimeCatalogByBatchId(batchId),
    fetchIndexCrimeRowsForRangeQuery(batchId, periodAStart, periodAEnd),
    fetchIndexCrimeRowsForRangeQuery(batchId, periodBStart, periodBEnd),
  ])

  const countsA = summarizeIndexCrimeCrimeCounts(rowsA, periodA)
  const countsB = summarizeIndexCrimeCrimeCounts(rowsB, periodB)

  return buildFocusCrimeComparisonRows(catalog, countsA, countsB)
}

const getCachedRegionalCrimeTypeComparison = unstable_cache(
  loadRegionalCrimeTypeComparison,
  ["crime-regional-focus-v1"],
  {
    revalidate: false,
    tags: [CRIME_COMPARE_CACHE_TAG],
  },
)

async function loadPeriodComparison(
  batchId: string,
  periodAStart: string,
  periodAEnd: string,
  periodBStart: string,
  periodBEnd: string,
): Promise<CrimeComparativeResult> {
  const periodA: CrimePeriodRange = {
    start: periodAStart,
    end: periodAEnd,
    label: "",
  }
  const periodB: CrimePeriodRange = {
    start: periodBStart,
    end: periodBEnd,
    label: "",
  }

  const [rowsA, rowsB] = await Promise.all([
    fetchIndexCrimeRowsForRangeQuery(batchId, periodAStart, periodAEnd),
    fetchIndexCrimeRowsForRangeQuery(batchId, periodBStart, periodBEnd),
  ])

  return buildComparativeResult(
    summarizeIndexCrimeRows(rowsA, periodA),
    summarizeIndexCrimeRows(rowsB, periodB),
  )
}

const getCachedPeriodComparison = unstable_cache(loadPeriodComparison, ["crime-period-compare-v1"], {
  revalidate: false,
  tags: [CRIME_COMPARE_CACHE_TAG],
})

export async function compareIndexCrimeForPpoByCrimeType(
  ppoCsvName: string,
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeFocusComparativeRow[]> {
  const batch = await getLatestStoredCrimeBatch()
  if (!batch) {
    return emptyFocusCrimeComparisonRows()
  }

  return getCachedPpoCrimeTypeComparison(
    batch.id,
    ppoCsvName.trim(),
    periodA.start,
    periodA.end,
    periodB.start,
    periodB.end,
  )
}

export async function compareIndexCrimeByCrimeType(
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeFocusComparativeRow[]> {
  const batch = await getLatestStoredCrimeBatch()
  if (!batch) {
    return emptyFocusCrimeComparisonRows()
  }

  return getCachedRegionalCrimeTypeComparison(
    batch.id,
    periodA.start,
    periodA.end,
    periodB.start,
    periodB.end,
  )
}

export async function compareIndexCrimePeriods(
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeComparativeResult> {
  const batch = await getLatestStoredCrimeBatch()
  if (!batch) {
    return buildComparativeResult(
      { ...periodA, totalVolume: 0, ppoBreakdown: [] },
      { ...periodB, totalVolume: 0, ppoBreakdown: [] },
    )
  }

  const result = await getCachedPeriodComparison(
    batch.id,
    periodA.start,
    periodA.end,
    periodB.start,
    periodB.end,
  )

  return {
    ...result,
    periodA: { ...result.periodA, label: periodA.label },
    periodB: { ...result.periodB, label: periodB.label },
  }
}

export async function replaceCrimeRecords({
  filename,
  uploadedByLabel,
  records,
}: ReplaceCrimeRecordsInput): Promise<ReplaceCrimeRecordsResult> {
  const supabase = createAdminClient()
  const analytics = buildCrimeAnalyticsFromRecords(records, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  const { data: batch, error: batchError } = await supabase
    .from("crime_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      record_count: records.length,
      analytics,
    })
    .select("id, filename, uploaded_by_label, record_count, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create crime upload batch.")
  }

  for (let index = 0; index < records.length; index += INSERT_CHUNK_SIZE) {
    const chunk = records.slice(index, index + INSERT_CHUNK_SIZE).map((record) =>
      toInsertRow(batch.id, record),
    )

    const { error: insertError } = await supabase.from("crime_records").insert(chunk)

    if (insertError) {
      await supabase.from("crime_upload_batches").delete().eq("id", batch.id)
      throw new Error(insertError.message)
    }
  }

  const { error: cleanupError } = await supabase
    .from("crime_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
    insertedCount: records.length,
    analytics: {
      ...analytics,
      lastUpdated: batch.created_at,
    },
  }
}
