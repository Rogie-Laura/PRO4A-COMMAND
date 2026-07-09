import { unstable_cache } from "next/cache"

import {
  buildUperAnalyticsFromWorkbook,
  emptyUperAnalytics,
} from "@/lib/uper-analytics"
import type { ParsedUperWorkbook, UperAnalytics, UperUploadBatchInfo } from "@/lib/uper-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const UPER_ANALYTICS_CACHE_TAG = "uper-analytics-v1"

type ReplaceUperWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedUperWorkbook
}

export type ReplaceUperWorkbookResult = {
  batch: UperUploadBatchInfo
  analytics: UperAnalytics
}

type StoredUperBatchRow = {
  id: string
  filename: string
  uploaded_by_label: string | null
  month_count: number
  created_at: string
  analytics: unknown
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  month_count: number
  created_at: string
}): UperUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    monthCount: row.month_count,
    createdAt: row.created_at,
  }
}

function isUperAnalytics(value: unknown): value is UperAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<UperAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.trend) &&
    Array.isArray(analytics.months)
  )
}

export async function getLatestUperUploadBatch(): Promise<UperUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("uper_upload_batches")
    .select("id, filename, uploaded_by_label, month_count, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestUperAnalytics(): Promise<UperAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("uper_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isUperAnalytics(data.analytics)) {
    return emptyUperAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedUperAnalytics = unstable_cache(
  loadLatestUperAnalytics,
  [UPER_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [UPER_ANALYTICS_CACHE_TAG],
  },
)

export async function getUperAnalytics(): Promise<UperAnalytics> {
  return getCachedUperAnalytics()
}

export async function replaceUperWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceUperWorkbookInput): Promise<ReplaceUperWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildUperAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady || !analytics.current) {
    throw new Error(`Walang ${analytics.focusOffice} ranking sa pinakabagong buwan ng workbook.`)
  }

  const { data: batch, error: batchError } = await supabase
    .from("uper_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      month_count: workbook.months.length,
      analytics,
    })
    .select("id, filename, uploaded_by_label, month_count, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create UPER upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("uper_upload_batches")
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
