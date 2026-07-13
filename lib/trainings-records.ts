import { unstable_cache } from "next/cache"

import {
  buildTrainingsAnalyticsFromWorkbook,
  emptyTrainingsAnalytics,
} from "@/lib/trainings-analytics"
import type {
  ParsedTrainingsWorkbook,
  TrainingsAnalytics,
  TrainingsUploadBatchInfo,
} from "@/lib/trainings-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const TRAININGS_ANALYTICS_CACHE_TAG = "trainings-analytics-upload-v1"

type ReplaceTrainingsWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedTrainingsWorkbook
}

export type ReplaceTrainingsWorkbookResult = {
  batch: TrainingsUploadBatchInfo
  analytics: TrainingsAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): TrainingsUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isTrainingsAnalytics(value: unknown): value is TrainingsAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<TrainingsAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.records) &&
    Array.isArray(analytics.statusStats)
  )
}

export async function getLatestTrainingsUploadBatch(): Promise<TrainingsUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("trainings_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestTrainingsAnalytics(): Promise<TrainingsAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("trainings_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isTrainingsAnalytics(data.analytics)) {
    return emptyTrainingsAnalytics()
  }

  return {
    ...data.analytics,
    dataSource: data.analytics.dataSource || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedTrainingsAnalytics = unstable_cache(
  loadLatestTrainingsAnalytics,
  [TRAININGS_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [TRAININGS_ANALYTICS_CACHE_TAG],
  },
)

export async function getTrainingsAnalytics(): Promise<TrainingsAnalytics> {
  return getCachedTrainingsAnalytics()
}

export async function replaceTrainingsWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceTrainingsWorkbookInput): Promise<ReplaceTrainingsWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildTrainingsAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na RTAP training data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("trainings_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create trainings upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("trainings_upload_batches")
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
