import { unstable_cache } from "next/cache"

import {
  buildStationClassificationAnalyticsFromWorkbook,
  emptyStationClassificationAnalytics,
} from "@/lib/station-classification-analytics"
import type {
  ParsedStationClassificationWorkbook,
  StationClassificationAnalytics,
  StationClassificationUploadBatchInfo,
} from "@/lib/station-classification-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const STATION_CLASSIFICATION_ANALYTICS_CACHE_TAG = "station-classification-analytics-v1"

type ReplaceStationClassificationWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedStationClassificationWorkbook
}

export type ReplaceStationClassificationWorkbookResult = {
  batch: StationClassificationUploadBatchInfo
  analytics: StationClassificationAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): StationClassificationUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isStationClassificationAnalytics(value: unknown): value is StationClassificationAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<StationClassificationAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.ppoRows) &&
    Array.isArray(analytics.groups)
  )
}

export async function getLatestStationClassificationUploadBatch(): Promise<StationClassificationUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("station_classification_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestStationClassificationAnalytics(): Promise<StationClassificationAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("station_classification_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isStationClassificationAnalytics(data.analytics)) {
    return emptyStationClassificationAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedStationClassificationAnalytics = unstable_cache(
  loadLatestStationClassificationAnalytics,
  [STATION_CLASSIFICATION_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [STATION_CLASSIFICATION_ANALYTICS_CACHE_TAG],
  },
)

export async function getStationClassificationAnalytics(): Promise<StationClassificationAnalytics> {
  return getCachedStationClassificationAnalytics()
}

export async function replaceStationClassificationWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceStationClassificationWorkbookInput): Promise<ReplaceStationClassificationWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildStationClassificationAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na station classification data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("station_classification_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create station classification upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("station_classification_upload_batches")
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
