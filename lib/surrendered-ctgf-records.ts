import { unstable_cache } from "next/cache"

import {
  buildSurrenderedCtgfAnalyticsFromWorkbook,
  emptySurrenderedCtgfAnalytics,
} from "@/lib/surrendered-ctgf-analytics"
import type {
  ParsedSurrenderedCtgfWorkbook,
  SurrenderedCtgfAnalytics,
  SurrenderedCtgfUploadBatchInfo,
} from "@/lib/surrendered-ctgf-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const SURRENDERED_CTGF_ANALYTICS_CACHE_TAG = "surrendered-ctgf-analytics-v1"

type ReplaceSurrenderedCtgfWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedSurrenderedCtgfWorkbook
}

export type ReplaceSurrenderedCtgfWorkbookResult = {
  batch: SurrenderedCtgfUploadBatchInfo
  analytics: SurrenderedCtgfAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): SurrenderedCtgfUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isSurrenderedCtgfAnalytics(value: unknown): value is SurrenderedCtgfAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<SurrenderedCtgfAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    typeof analytics.title === "string" &&
    Array.isArray(analytics.rows)
  )
}

export async function getLatestSurrenderedCtgfUploadBatch(): Promise<SurrenderedCtgfUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("surrendered_ctgf_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestSurrenderedCtgfAnalytics(): Promise<SurrenderedCtgfAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("surrendered_ctgf_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isSurrenderedCtgfAnalytics(data.analytics)) {
    return emptySurrenderedCtgfAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedSurrenderedCtgfAnalytics = unstable_cache(
  loadLatestSurrenderedCtgfAnalytics,
  [SURRENDERED_CTGF_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [SURRENDERED_CTGF_ANALYTICS_CACHE_TAG],
  },
)

export async function getSurrenderedCtgfAnalytics(): Promise<SurrenderedCtgfAnalytics> {
  return getCachedSurrenderedCtgfAnalytics()
}

export async function replaceSurrenderedCtgfWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceSurrenderedCtgfWorkbookInput): Promise<ReplaceSurrenderedCtgfWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildSurrenderedCtgfAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na surrendered CTGs data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("surrendered_ctgf_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create surrendered CTGs upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("surrendered_ctgf_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
    analytics,
  }
}
