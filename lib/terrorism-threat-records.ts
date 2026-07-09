import { unstable_cache } from "next/cache"

import {
  buildTerrorismThreatAnalyticsFromWorkbook,
  emptyTerrorismThreatAnalytics,
} from "@/lib/terrorism-threat-analytics"
import type {
  ParsedTerrorismThreatWorkbook,
  TerrorismThreatAnalytics,
  TerrorismThreatUploadBatchInfo,
} from "@/lib/terrorism-threat-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const TERRORISM_THREAT_ANALYTICS_CACHE_TAG = "terrorism-threat-analytics-v1"

type ReplaceTerrorismThreatWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedTerrorismThreatWorkbook
}

export type ReplaceTerrorismThreatWorkbookResult = {
  batch: TerrorismThreatUploadBatchInfo
  analytics: TerrorismThreatAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): TerrorismThreatUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isTerrorismThreatAnalytics(value: unknown): value is TerrorismThreatAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<TerrorismThreatAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.rows)
  )
}

export async function getLatestTerrorismThreatUploadBatch(): Promise<TerrorismThreatUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("terrorism_threat_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestTerrorismThreatAnalytics(): Promise<TerrorismThreatAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("terrorism_threat_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isTerrorismThreatAnalytics(data.analytics)) {
    return emptyTerrorismThreatAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedTerrorismThreatAnalytics = unstable_cache(
  loadLatestTerrorismThreatAnalytics,
  [TERRORISM_THREAT_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [TERRORISM_THREAT_ANALYTICS_CACHE_TAG],
  },
)

export async function getTerrorismThreatAnalytics(): Promise<TerrorismThreatAnalytics> {
  return getCachedTerrorismThreatAnalytics()
}

export async function replaceTerrorismThreatWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceTerrorismThreatWorkbookInput): Promise<ReplaceTerrorismThreatWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildTerrorismThreatAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na terrorism threat level data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("terrorism_threat_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create terrorism threat upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("terrorism_threat_upload_batches")
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
