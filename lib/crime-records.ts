import { buildCrimeAnalyticsFromRecords } from "@/lib/crime-analytics"
import { isIndexCrimeCategory } from "@/lib/crime-config"
import {
  buildComparativeResult,
  type CrimeComparativeResult,
  type CrimePeriodRange,
  type CrimePeriodSnapshot,
} from "@/lib/crime-comparative"
import { getEffectiveCrimeDate, isIsoDateInRange } from "@/lib/crime-dates"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CrimeAnalytics } from "@/lib/crime-types"
import type { CountItem } from "@/lib/personnel-types"
import type { ParsedCrimeRecord } from "@/lib/crime-xlsx-parser"

const INSERT_CHUNK_SIZE = 1000
const FETCH_PAGE_SIZE = 1000

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
  category: string
  date_committed: string | null
  date_reported: string | null
}): IndexCrimeRangeRow {
  return {
    ppo: row.ppo,
    category: row.category ?? "",
    dateCommitted: row.date_committed,
    dateReported: row.date_reported,
  }
}

async function fetchIndexCrimeRowsForRangeQuery(
  batchId: string,
  startIso: string,
  endIso: string,
  mode: "committed" | "reported",
): Promise<IndexCrimeRangeRow[]> {
  const supabase = createAdminClient()
  const rows: IndexCrimeRangeRow[] = []
  let from = 0

  while (true) {
    let query = supabase
      .from("crime_records")
      .select("ppo, category, date_committed, date_reported")
      .eq("batch_id", batchId)

    if (mode === "committed") {
      query = query
        .gte("date_committed", startIso)
        .lte("date_committed", endIso)
        .not("date_committed", "eq", "")
    } else {
      query = query
        .is("date_committed", null)
        .gte("date_reported", startIso)
        .lte("date_reported", endIso)
        .not("date_reported", "eq", "")
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

  const [committedRows, reportedRows] = await Promise.all([
    fetchIndexCrimeRowsForRangeQuery(batch.id, range.start, range.end, "committed"),
    fetchIndexCrimeRowsForRangeQuery(batch.id, range.start, range.end, "reported"),
  ])

  return summarizeIndexCrimeRows([...committedRows, ...reportedRows], range)
}

export async function compareIndexCrimePeriods(
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeComparativeResult> {
  const [snapshotA, snapshotB] = await Promise.all([
    fetchIndexCrimePeriodSnapshot(periodA),
    fetchIndexCrimePeriodSnapshot(periodB),
  ])

  return buildComparativeResult(snapshotA, snapshotB)
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
