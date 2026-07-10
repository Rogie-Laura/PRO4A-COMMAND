import { unstable_cache } from "next/cache"

import {
  buildForeignNationalAnalyticsFromWorkbook,
  emptyForeignNationalAnalytics,
} from "@/lib/foreign-national-analytics"
import type {
  ForeignNationalAnalytics,
  ForeignNationalUploadBatchInfo,
  ParsedForeignNationalWorkbook,
} from "@/lib/foreign-national-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const FOREIGN_NATIONAL_ANALYTICS_CACHE_TAG = "foreign-national-analytics-v1"

type ReplaceForeignNationalWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedForeignNationalWorkbook
}

export type ReplaceForeignNationalWorkbookResult = {
  batch: ForeignNationalUploadBatchInfo
  analytics: ForeignNationalAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): ForeignNationalUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isForeignNationalAnalytics(value: unknown): value is ForeignNationalAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<ForeignNationalAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    typeof analytics.title === "string" &&
    Array.isArray(analytics.rows) &&
    typeof analytics.grandTotal === "number"
  )
}

export async function getLatestForeignNationalUploadBatch(): Promise<ForeignNationalUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("foreign_national_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestForeignNationalAnalytics(): Promise<ForeignNationalAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("foreign_national_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isForeignNationalAnalytics(data.analytics)) {
    return emptyForeignNationalAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedForeignNationalAnalytics = unstable_cache(
  loadLatestForeignNationalAnalytics,
  [FOREIGN_NATIONAL_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [FOREIGN_NATIONAL_ANALYTICS_CACHE_TAG],
  },
)

export async function getForeignNationalAnalytics(): Promise<ForeignNationalAnalytics> {
  return getCachedForeignNationalAnalytics()
}

export async function replaceForeignNationalWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceForeignNationalWorkbookInput): Promise<ReplaceForeignNationalWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildForeignNationalAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na foreign national data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("foreign_national_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create foreign national upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("foreign_national_upload_batches")
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
