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

export type BmiUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  recordCount: number
  createdAt: string
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
  analytics: unknown
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  record_count: number
  created_at: string
}): BmiUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    recordCount: row.record_count,
    createdAt: row.created_at,
  }
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
    .select("id, filename, uploaded_by_label, record_count, created_at, analytics")
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
      analytics,
    })
    .select("id, filename, uploaded_by_label, record_count, created_at")
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

  const { error: cleanupError } = await supabase
    .from("bmi_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
    insertedCount: records.length,
  }
}
