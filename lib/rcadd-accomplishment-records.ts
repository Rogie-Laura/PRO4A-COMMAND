import { unstable_cache } from "next/cache"

import {
  buildRcaddAnalyticsFromWorkbook,
  emptyRcaddAnalytics,
} from "@/lib/rcadd-accomplishment-analytics"
import type {
  ParsedRcaddWorkbook,
  RcaddAnalytics,
  RcaddUploadBatchInfo,
} from "@/lib/rcadd-accomplishment-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const RCADD_ANALYTICS_CACHE_TAG = "rcadd-accomplishment-analytics-v1"

type ReplaceRcaddWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedRcaddWorkbook
}

export type ReplaceRcaddWorkbookResult = {
  batch: RcaddUploadBatchInfo
  analytics: RcaddAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): RcaddUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isRcaddAnalytics(value: unknown): value is RcaddAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<RcaddAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.metrics)
  )
}

export async function getLatestRcaddUploadBatch(): Promise<RcaddUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("rcadd_accomplishment_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestRcaddAnalytics(): Promise<RcaddAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("rcadd_accomplishment_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isRcaddAnalytics(data.analytics)) {
    return emptyRcaddAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedRcaddAnalytics = unstable_cache(
  loadLatestRcaddAnalytics,
  [RCADD_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [RCADD_ANALYTICS_CACHE_TAG],
  },
)

export async function getRcaddAnalytics(): Promise<RcaddAnalytics> {
  return getCachedRcaddAnalytics()
}

export async function replaceRcaddWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceRcaddWorkbookInput): Promise<ReplaceRcaddWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildRcaddAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na RCADD accomplishment data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("rcadd_accomplishment_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create RCADD upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("rcadd_accomplishment_upload_batches")
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
