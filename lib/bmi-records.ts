import {
  buildHealthAnalyticsSummaryFromCategoryCounts,
  buildHealthAnalyticsSummaryFromParsedRecords,
} from "@/lib/bmi-analytics-build"
import { BMI_CATEGORIES, isBmiDrilldownCategory, type BmiCategoryId } from "@/lib/bmi-config"
import { createAdminClient } from "@/lib/supabase/admin"
import type { BmiPersonnelDetail, HealthAnalyticsSummary } from "@/lib/health-types"
import type { ParsedBmiRecord } from "@/lib/bmi-xlsx-parser"

const INSERT_CHUNK_SIZE = 1000
const FETCH_PAGE_SIZE = 1000

const MAX_RETAINED_MONTHS = 12

export type BmiUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  recordCount: number
  createdAt: string
  periodMonth: string | null
}

/** Minimal per-person row used for month-over-month tracking. */
export type BmiComparisonRow = {
  rankFullname: string
  fullName: string
  rank: string
  subUnit: string
  assignment: string
  age: number | null
  weightKg: number | null
  categoryId: BmiCategoryId | null
  bmiResult: number | null
}

export type BmiMonthBatch = {
  id: string
  filename: string
  periodMonth: string | null
  createdAt: string
  rows: BmiComparisonRow[]
}

export type StoredBmiRecord = {
  id: number
  rank: string
  fullName: string
  subUnit: string
  assignment: string
  bmiClass: string
  bmiCategoryId: BmiCategoryId | null
  age: number | null
  bmiResult: number | null
}

type ReplaceBmiRecordsInput = {
  filename: string
  uploadedByLabel: string
  records: ParsedBmiRecord[]
}

export type ReplaceBmiRecordsResult = {
  batch: BmiUploadBatchInfo
  insertedCount: number
  skippedRows?: number
}

type StoredBmiBatchRow = {
  id: string
  filename: string
  uploaded_by_label: string | null
  record_count: number
  created_at: string
  period_month: string | null
  analytics: unknown
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  record_count: number
  created_at: string
  period_month?: string | null
}): BmiUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    recordCount: row.record_count,
    createdAt: row.created_at,
    periodMonth: row.period_month ?? null,
  }
}

/** The dominant YYYY-MM among the records' Date Taken values (null if none dated). */
function deriveMonthKey(records: ParsedBmiRecord[]): string | null {
  const counts = new Map<string, number>()
  for (const record of records) {
    if (!record.dateTaken) continue
    const monthKey = record.dateTaken.slice(0, 7)
    if (monthKey.length !== 7) continue
    counts.set(monthKey, (counts.get(monthKey) ?? 0) + 1)
  }

  let best: string | null = null
  let bestCount = 0
  for (const [monthKey, count] of counts) {
    if (count > bestCount) {
      bestCount = count
      best = monthKey
    }
  }

  return best
}

function mapStoredRecord(row: {
  id: number
  rank: string
  full_name: string
  sub_unit: string
  assignment: string
  bmi_class: string
  bmi_category_id: string | null
  age: number | null
  bmi_result: number | null
}): StoredBmiRecord {
  return {
    id: row.id,
    rank: row.rank,
    fullName: row.full_name,
    subUnit: row.sub_unit,
    assignment: row.assignment,
    bmiClass: row.bmi_class,
    bmiCategoryId: (row.bmi_category_id as BmiCategoryId | null) ?? null,
    age: row.age,
    bmiResult: row.bmi_result,
  }
}

function toInsertRow(batchId: string, record: ParsedBmiRecord) {
  return {
    batch_id: batchId,
    rank_fullname: record.rankFullname,
    rank: record.rank,
    full_name: record.fullName,
    sub_unit: record.subUnit,
    assignment: record.assignment,
    bmi_class: record.bmiClass,
    bmi_category_id: record.bmiCategoryId,
    age: record.age,
    height_cm: record.heightCm,
    weight_kg: record.weightKg,
    waist_cm: record.waistCm,
    hip_cm: record.hipCm,
    wrist_cm: record.wristCm,
    bmi_result: record.bmiResult,
    encoded_by: record.encodedBy,
    date_taken: record.dateTaken,
  }
}

function isHealthAnalyticsSummary(value: unknown): value is HealthAnalyticsSummary {
  if (!value || typeof value !== "object") return false

  const summary = value as Partial<HealthAnalyticsSummary>
  return (
    summary.dataReady === true &&
    typeof summary.totalAssessed === "number" &&
    Array.isArray(summary.categories) &&
    summary.categories.length > 0
  )
}

function normalizeStoredSummary(
  summary: HealthAnalyticsSummary,
  batch: { filename: string; created_at: string },
): HealthAnalyticsSummary {
  return {
    ...summary,
    lastUpdated: summary.lastUpdated || batch.created_at,
    dataReady: summary.totalAssessed > 0,
  }
}

function formatStoredPersonName(record: StoredBmiRecord) {
  const parts = record.fullName.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    const surname = parts[parts.length - 1]
    const firstName = parts[0]
    const middle = parts.length > 2 && parts[1] ? ` ${parts[1].charAt(0)}.` : ""
    return `${surname}, ${firstName}${middle}`
  }

  return record.fullName || record.rank || "Unknown"
}

function mapStoredRecordToPersonnelDetail(record: StoredBmiRecord): BmiPersonnelDetail {
  const name = formatStoredPersonName(record)
  const unit = record.subUnit || record.assignment

  return {
    id: String(record.id),
    rank: record.rank,
    name,
    unit: unit || "—",
    age: record.age != null ? String(record.age) : "—",
  }
}

async function getLatestStoredBmiBatch(): Promise<StoredBmiBatchRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("bmi_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at, period_month, analytics")
    .order("period_month", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function persistBatchAnalytics(batchId: string, analytics: HealthAnalyticsSummary) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("bmi_upload_batches")
    .update({ analytics })
    .eq("id", batchId)

  if (error) {
    throw new Error(error.message)
  }
}

async function rebuildBmiAnalyticsSummary(batch: StoredBmiBatchRow): Promise<HealthAnalyticsSummary | null> {
  const supabase = createAdminClient()
  const categoryCounts = Object.fromEntries(
    BMI_CATEGORIES.map((category) => [category.id, 0]),
  ) as Record<BmiCategoryId, number>

  await Promise.all(
    BMI_CATEGORIES.map(async (category) => {
      const { count, error } = await supabase
        .from("bmi_records")
        .select("*", { count: "exact", head: true })
        .eq("batch_id", batch.id)
        .eq("bmi_category_id", category.id)

      if (error) {
        throw new Error(error.message)
      }

      categoryCounts[category.id] = count ?? 0
    }),
  )

  const totalAssessed = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
  if (totalAssessed === 0) {
    return null
  }

  const rebuilt = buildHealthAnalyticsSummaryFromCategoryCounts(categoryCounts, {
    fileName: batch.filename,
    lastUpdated: batch.created_at,
  })

  try {
    await persistBatchAnalytics(batch.id, rebuilt)
  } catch {
    // Still serve rebuilt summary even if cache write fails.
  }

  return rebuilt
}

export async function getLatestBmiUploadBatch(): Promise<BmiUploadBatchInfo | null> {
  const batch = await getLatestStoredBmiBatch()
  return batch ? mapBatch(batch) : null
}

export async function fetchStoredBmiAnalytics(): Promise<HealthAnalyticsSummary | null> {
  const batch = await getLatestStoredBmiBatch()
  if (!batch) return null

  if (isHealthAnalyticsSummary(batch.analytics)) {
    return normalizeStoredSummary(batch.analytics, batch)
  }

  return rebuildBmiAnalyticsSummary(batch)
}

export async function fetchBmiPersonnelByCategory(
  categoryId: BmiCategoryId,
): Promise<BmiPersonnelDetail[]> {
  if (!isBmiDrilldownCategory(categoryId)) {
    return []
  }

  const batch = await getLatestStoredBmiBatch()
  if (!batch) return []

  const supabase = createAdminClient()
  const records: StoredBmiRecord[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("bmi_records")
      .select("id, rank, full_name, sub_unit, assignment, bmi_class, bmi_category_id, age, bmi_result")
      .eq("batch_id", batch.id)
      .eq("bmi_category_id", categoryId)
      .order("full_name", { ascending: true })
      .order("rank", { ascending: true })
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
    .map(mapStoredRecordToPersonnelDetail)
    .sort((left, right) => {
      const byName = left.name.localeCompare(right.name, "en", { sensitivity: "base" })
      if (byName !== 0) return byName
      return left.rank.localeCompare(right.rank, "en", { sensitivity: "base" })
    })
}

/** @deprecated Use fetchStoredBmiAnalytics for dashboard loads. */
export async function fetchStoredBmiRecords(): Promise<{
  batch: BmiUploadBatchInfo
  records: StoredBmiRecord[]
} | null> {
  const batch = await getLatestBmiUploadBatch()
  if (!batch) return null

  const supabase = createAdminClient()
  const records: StoredBmiRecord[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("bmi_records")
      .select(
        "id, rank, full_name, sub_unit, assignment, bmi_class, bmi_category_id, age, bmi_result",
      )
      .eq("batch_id", batch.id)
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

  if (records.length === 0) {
    return null
  }

  return { batch, records }
}

export async function replaceBmiRecords({
  filename,
  uploadedByLabel,
  records,
}: ReplaceBmiRecordsInput): Promise<ReplaceBmiRecordsResult> {
  const supabase = createAdminClient()
  const uploadedAt = new Date().toISOString()
  const periodMonth = deriveMonthKey(records)
  const analytics = buildHealthAnalyticsSummaryFromParsedRecords(records, {
    fileName: filename,
    lastUpdated: uploadedAt,
  })

  const { data: batch, error: batchError } = await supabase
    .from("bmi_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      record_count: records.length,
      period_month: periodMonth,
      analytics,
    })
    .select("id, filename, uploaded_by_label, record_count, created_at, period_month")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create BMI upload batch.")
  }

  for (let index = 0; index < records.length; index += INSERT_CHUNK_SIZE) {
    const chunk = records.slice(index, index + INSERT_CHUNK_SIZE).map((record) =>
      toInsertRow(batch.id, record),
    )

    const { error: insertError } = await supabase.from("bmi_records").insert(chunk)

    if (insertError) {
      await supabase.from("bmi_upload_batches").delete().eq("id", batch.id)
      throw new Error(insertError.message)
    }
  }

  // Retain one batch per month: only replace a prior upload for the SAME month
  // (or the untagged legacy batch when this upload has no dated rows).
  const replaceSameMonth = supabase.from("bmi_upload_batches").delete().neq("id", batch.id)
  const { error: cleanupError } = periodMonth
    ? await replaceSameMonth.eq("period_month", periodMonth)
    : await replaceSameMonth.is("period_month", null)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  await pruneOldBmiMonths(supabase)

  return {
    batch: mapBatch(batch),
    insertedCount: records.length,
  }
}

export async function beginBmiUploadBatch(
  filename: string,
  uploadedByLabel: string,
): Promise<BmiUploadBatchInfo> {
  const supabase = createAdminClient()
  const { data: batch, error } = await supabase
    .from("bmi_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      record_count: 0,
    })
    .select("id, filename, uploaded_by_label, record_count, created_at, period_month")
    .single()

  if (error || !batch) {
    throw new Error(error?.message ?? "Unable to create BMI upload batch.")
  }

  return mapBatch(batch)
}

export async function appendBmiRecordsChunk(batchId: string, records: ParsedBmiRecord[]) {
  if (records.length === 0) return

  const supabase = createAdminClient()
  for (let index = 0; index < records.length; index += INSERT_CHUNK_SIZE) {
    const chunk = records.slice(index, index + INSERT_CHUNK_SIZE).map((record) =>
      toInsertRow(batchId, record),
    )

    const { error } = await supabase.from("bmi_records").insert(chunk)
    if (error) {
      throw new Error(error.message)
    }
  }
}

export async function abortBmiUploadBatch(batchId: string) {
  const supabase = createAdminClient()
  await supabase.from("bmi_upload_batches").delete().eq("id", batchId)
}

/** Reads back the stored rows to compute category counts + dominant month. */
async function computeBmiBatchTotals(batchId: string): Promise<{
  categoryCounts: Record<BmiCategoryId, number>
  total: number
  monthKey: string | null
}> {
  const supabase = createAdminClient()
  const categoryCounts = Object.fromEntries(
    BMI_CATEGORIES.map((category) => [category.id, 0]),
  ) as Record<BmiCategoryId, number>
  const monthTallies = new Map<string, number>()
  let total = 0
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("bmi_records")
      .select("bmi_category_id, date_taken")
      .eq("batch_id", batchId)
      .order("id", { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      const categoryId = row.bmi_category_id as BmiCategoryId | null
      if (categoryId && categoryId in categoryCounts) {
        categoryCounts[categoryId] += 1
        total += 1
      }
      if (row.date_taken) {
        const monthKey = String(row.date_taken).slice(0, 7)
        if (monthKey.length === 7) {
          monthTallies.set(monthKey, (monthTallies.get(monthKey) ?? 0) + 1)
        }
      }
    }

    if (data.length < FETCH_PAGE_SIZE) break
    from += FETCH_PAGE_SIZE
  }

  let monthKey: string | null = null
  let bestCount = 0
  for (const [key, count] of monthTallies) {
    if (count > bestCount) {
      bestCount = count
      monthKey = key
    }
  }

  return { categoryCounts, total, monthKey }
}

export async function finalizeBmiUploadBatch(batchId: string): Promise<ReplaceBmiRecordsResult> {
  const supabase = createAdminClient()

  const { data: batch, error: batchError } = await supabase
    .from("bmi_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at, period_month")
    .eq("id", batchId)
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to load BMI upload batch.")
  }

  const { categoryCounts, total, monthKey } = await computeBmiBatchTotals(batchId)

  if (total === 0) {
    await abortBmiUploadBatch(batchId)
    throw new Error("No valid BMI records were saved for this upload.")
  }

  const analytics = buildHealthAnalyticsSummaryFromCategoryCounts(categoryCounts, {
    fileName: batch.filename,
    lastUpdated: batch.created_at,
  })

  const { error: updateError } = await supabase
    .from("bmi_upload_batches")
    .update({ record_count: total, period_month: monthKey, analytics })
    .eq("id", batchId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  // Retain one batch per month (replace a prior same-month upload only).
  const replaceSameMonth = supabase.from("bmi_upload_batches").delete().neq("id", batchId)
  const { error: cleanupError } = monthKey
    ? await replaceSameMonth.eq("period_month", monthKey)
    : await replaceSameMonth.is("period_month", null)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  await pruneOldBmiMonths(supabase)

  return {
    batch: mapBatch({ ...batch, record_count: total, period_month: monthKey }),
    insertedCount: total,
  }
}

/** Keep only the most recent MAX_RETAINED_MONTHS monthly snapshots. */
async function pruneOldBmiMonths(supabase: ReturnType<typeof createAdminClient>) {
  const { data, error } = await supabase
    .from("bmi_upload_batches")
    .select("period_month")
    .not("period_month", "is", null)

  if (error || !data) return

  const months = Array.from(new Set(data.map((row) => row.period_month as string))).sort((a, b) =>
    b.localeCompare(a),
  )

  const monthsToDrop = months.slice(MAX_RETAINED_MONTHS)
  if (monthsToDrop.length === 0) return

  await supabase.from("bmi_upload_batches").delete().in("period_month", monthsToDrop)
}

/** All stored monthly snapshots, newest month first. */
export async function listBmiStoredMonths(): Promise<BmiUploadBatchInfo[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("bmi_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at, period_month")
    .order("period_month", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapBatch)
}

async function fetchComparisonRows(batchId: string): Promise<BmiComparisonRow[]> {
  const supabase = createAdminClient()
  const rows: BmiComparisonRow[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("bmi_records")
      .select("rank_fullname, full_name, rank, sub_unit, assignment, age, weight_kg, bmi_category_id, bmi_result")
      .eq("batch_id", batchId)
      .order("id", { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      rows.push({
        rankFullname: row.rank_fullname ?? "",
        fullName: row.full_name ?? "",
        rank: row.rank ?? "",
        subUnit: row.sub_unit ?? "",
        assignment: row.assignment ?? "",
        age: row.age != null ? Number(row.age) : null,
        weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
        categoryId: (row.bmi_category_id as BmiCategoryId | null) ?? null,
        bmiResult: row.bmi_result != null ? Number(row.bmi_result) : null,
      })
    }

    if (data.length < FETCH_PAGE_SIZE) break
    from += FETCH_PAGE_SIZE
  }

  return rows
}

export type BmiTrendCandidateRow = {
  fullName: string
  rankFullname: string
  weightKg: number | null
  bmiResult: number | null
  categoryId: BmiCategoryId | null
  periodMonth: string | null
  createdAt: string
}

/**
 * Rows across ALL stored months whose full name contains `token` (a surname or
 * long name token). The caller narrows these to a single person by exact name key.
 */
export async function fetchBmiRecordsByNameToken(token: string): Promise<BmiTrendCandidateRow[]> {
  const trimmed = token.trim()
  if (!trimmed) return []

  const supabase = createAdminClient()
  const escaped = trimmed.replace(/[%_]/g, (match) => `\\${match}`)
  const rows: BmiTrendCandidateRow[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("bmi_records")
      .select(
        "full_name, rank_fullname, weight_kg, bmi_result, bmi_category_id, bmi_upload_batches!inner(period_month, created_at)",
      )
      .ilike("full_name", `%${escaped}%`)
      .order("id", { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      const batch = row.bmi_upload_batches as unknown as
        | { period_month: string | null; created_at: string }
        | { period_month: string | null; created_at: string }[]
        | null
      const batchInfo = Array.isArray(batch) ? batch[0] : batch

      rows.push({
        fullName: row.full_name ?? "",
        rankFullname: row.rank_fullname ?? "",
        weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
        bmiResult: row.bmi_result != null ? Number(row.bmi_result) : null,
        categoryId: (row.bmi_category_id as BmiCategoryId | null) ?? null,
        periodMonth: batchInfo?.period_month ?? null,
        createdAt: batchInfo?.created_at ?? "",
      })
    }

    if (data.length < FETCH_PAGE_SIZE) break
    from += FETCH_PAGE_SIZE
  }

  return rows
}

/**
 * The two newest monthly snapshots (current + previous) with their per-person rows,
 * for month-over-month weight and BMI-category movement. Returns null when fewer
 * than two months are stored.
 */
export async function fetchTwoRecentBmiBatchesForComparison(): Promise<{
  current: BmiMonthBatch
  previous: BmiMonthBatch
} | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("bmi_upload_batches")
    .select("id, filename, created_at, period_month")
    .order("period_month", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(2)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length < 2) return null

  const [currentMeta, previousMeta] = data
  const [currentRows, previousRows] = await Promise.all([
    fetchComparisonRows(currentMeta.id),
    fetchComparisonRows(previousMeta.id),
  ])

  return {
    current: {
      id: currentMeta.id,
      filename: currentMeta.filename,
      periodMonth: currentMeta.period_month ?? null,
      createdAt: currentMeta.created_at,
      rows: currentRows,
    },
    previous: {
      id: previousMeta.id,
      filename: previousMeta.filename,
      periodMonth: previousMeta.period_month ?? null,
      createdAt: previousMeta.created_at,
      rows: previousRows,
    },
  }
}
