import { unstable_cache } from "next/cache"

import { buildEstablishmentAnalyticsFromRecords, emptyEstablishmentAnalytics } from "@/lib/establishment-analytics"
import type {
  EstablishmentAnalytics,
  EstablishmentUploadBatchInfo,
  ParsedEstablishmentRecord,
  ParsedEstablishmentWorkbook,
} from "@/lib/establishment-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const ESTABLISHMENT_ANALYTICS_CACHE_TAG = "establishment-analytics-v1"

const INSERT_CHUNK_SIZE = 1000

type ReplaceEstablishmentWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedEstablishmentWorkbook
}

export type ReplaceEstablishmentWorkbookResult = {
  batch: EstablishmentUploadBatchInfo
  insertedCount: number
  analytics: EstablishmentAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  record_count: number
  created_at: string
}): EstablishmentUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    recordCount: row.record_count,
    createdAt: row.created_at,
  }
}

function toInsertRow(batchId: string, record: ParsedEstablishmentRecord) {
  return {
    batch_id: batchId,
    province: record.province,
    ppo: record.ppo,
    station: record.station,
    latitude: record.latitude,
    longitude: record.longitude,
    sector_no: record.sectorNo,
    establishment_type: record.establishmentType,
    name: record.name,
    location: record.location,
    contact_person: record.contactPerson,
  }
}

function isEstablishmentAnalytics(value: unknown): value is EstablishmentAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<EstablishmentAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    typeof analytics.totalCount === "number" &&
    Array.isArray(analytics.types)
  )
}

export async function getLatestEstablishmentUploadBatch(): Promise<EstablishmentUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("establishment_upload_batches")
    .select("id, filename, uploaded_by_label, record_count, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestEstablishmentAnalytics(): Promise<EstablishmentAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("establishment_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isEstablishmentAnalytics(data.analytics)) {
    return emptyEstablishmentAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedEstablishmentAnalytics = unstable_cache(
  loadLatestEstablishmentAnalytics,
  [ESTABLISHMENT_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [ESTABLISHMENT_ANALYTICS_CACHE_TAG],
  },
)

export async function getEstablishmentAnalytics(): Promise<EstablishmentAnalytics> {
  return getCachedEstablishmentAnalytics()
}

export async function replaceEstablishmentWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceEstablishmentWorkbookInput): Promise<ReplaceEstablishmentWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildEstablishmentAnalyticsFromRecords(workbook.records, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  const { data: batch, error: batchError } = await supabase
    .from("establishment_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      record_count: workbook.records.length,
      analytics,
    })
    .select("id, filename, uploaded_by_label, record_count, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create establishment upload batch.")
  }

  for (let index = 0; index < workbook.records.length; index += INSERT_CHUNK_SIZE) {
    const chunk = workbook.records
      .slice(index, index + INSERT_CHUNK_SIZE)
      .map((record) => toInsertRow(batch.id, record))

    const { error: insertError } = await supabase.from("establishments").insert(chunk)

    if (insertError) {
      await supabase.from("establishment_upload_batches").delete().eq("id", batch.id)
      throw new Error(insertError.message)
    }
  }

  const { error: cleanupError } = await supabase
    .from("establishment_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
    insertedCount: workbook.records.length,
    analytics: {
      ...analytics,
      lastUpdated: batch.created_at,
    },
  }
}
