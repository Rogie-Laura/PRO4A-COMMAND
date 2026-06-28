import { buildCrimeAnalyticsFromRecords } from "@/lib/crime-analytics"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CrimeAnalytics } from "@/lib/crime-types"
import type { ParsedCrimeRecord } from "@/lib/crime-xlsx-parser"

const INSERT_CHUNK_SIZE = 1000

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

export async function getLatestCrimeUploadBatch(): Promise<CrimeUploadBatchInfo | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crime_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

export async function fetchStoredCrimeAnalytics(): Promise<CrimeAnalytics | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crime_upload_batches")
    .select("filename, analytics, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.analytics) {
    return null
  }

  const analytics = data.analytics as CrimeAnalytics
  if (!analytics.dataReady) {
    return null
  }

  return {
    ...analytics,
    fileName: analytics.fileName || data.filename,
    lastUpdated: analytics.lastUpdated || data.created_at,
    categoryBreakdown: analytics.categoryBreakdown ?? [],
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
