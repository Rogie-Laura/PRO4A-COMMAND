import { createAdminClient } from "@/lib/supabase/admin"
import type { ParsedBmiRecord } from "@/lib/bmi-xlsx-parser"
import type { BmiCategoryId } from "@/lib/bmi-config"

const INSERT_CHUNK_SIZE = 1000

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

export async function getLatestBmiUploadBatch(): Promise<BmiUploadBatchInfo | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("bmi_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

export async function fetchStoredBmiRecords(): Promise<{
  batch: BmiUploadBatchInfo
  records: StoredBmiRecord[]
} | null> {
  const batch = await getLatestBmiUploadBatch()
  if (!batch) return null

  const supabase = createAdminClient()
  const records: StoredBmiRecord[] = []
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("bmi_records")
      .select(
        "id, rank, full_name, sub_unit, assignment, bmi_class, bmi_category_id, age, bmi_result",
      )
      .eq("batch_id", batch.id)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      break
    }

    records.push(...data.map(mapStoredRecord))

    if (data.length < pageSize) {
      break
    }

    from += pageSize
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

  const { data: batch, error: batchError } = await supabase
    .from("bmi_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      record_count: records.length,
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
