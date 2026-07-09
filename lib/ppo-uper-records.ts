import { unstable_cache } from "next/cache"

import {
  buildPpoUperAnalyticsFromWorkbook,
  emptyPpoUperAnalytics,
} from "@/lib/ppo-uper-analytics"
import type {
  ParsedPpoUperWorkbook,
  PpoUperAnalytics,
  PpoUperUploadBatchInfo,
} from "@/lib/ppo-uper-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const PPO_UPER_ANALYTICS_CACHE_TAG = "ppo-uper-analytics-v1"

type ReplacePpoUperWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedPpoUperWorkbook
}

export type ReplacePpoUperWorkbookResult = {
  batch: PpoUperUploadBatchInfo
  analytics: PpoUperAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  month_count: number
  created_at: string
}): PpoUperUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    monthCount: row.month_count,
    createdAt: row.created_at,
  }
}

function isPpoUperAnalytics(value: unknown): value is PpoUperAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<PpoUperAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.rankings) &&
    Array.isArray(analytics.months)
  )
}

export async function getLatestPpoUperUploadBatch(): Promise<PpoUperUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("ppo_uper_upload_batches")
    .select("id, filename, uploaded_by_label, month_count, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestPpoUperAnalytics(): Promise<PpoUperAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("ppo_uper_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isPpoUperAnalytics(data.analytics)) {
    return emptyPpoUperAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedPpoUperAnalytics = unstable_cache(
  loadLatestPpoUperAnalytics,
  [PPO_UPER_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [PPO_UPER_ANALYTICS_CACHE_TAG],
  },
)

export async function getPpoUperAnalytics(): Promise<PpoUperAnalytics> {
  return getCachedPpoUperAnalytics()
}

export async function replacePpoUperWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplacePpoUperWorkbookInput): Promise<ReplacePpoUperWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildPpoUperAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady || analytics.rankings.length === 0) {
    throw new Error("Walang valid na PPO UPER data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("ppo_uper_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      month_count: workbook.months.length,
      analytics,
    })
    .select("id, filename, uploaded_by_label, month_count, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create PPO UPER upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("ppo_uper_upload_batches")
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
