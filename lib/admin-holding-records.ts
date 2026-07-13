import { unstable_cache } from "next/cache"

import {
  buildAdminHoldingAnalyticsFromWorkbook,
  emptyAdminHoldingAnalytics,
} from "@/lib/admin-holding-analytics"
import type {
  AdminHoldingAnalytics,
  AdminHoldingUploadBatchInfo,
  ParsedAdminHoldingWorkbook,
} from "@/lib/admin-holding-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const ADMIN_HOLDING_ANALYTICS_CACHE_TAG = "admin-holding-analytics-v1"

type ReplaceAdminHoldingWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedAdminHoldingWorkbook
}

export type ReplaceAdminHoldingWorkbookResult = {
  batch: AdminHoldingUploadBatchInfo
  analytics: AdminHoldingAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): AdminHoldingUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isAdminHoldingAnalytics(value: unknown): value is AdminHoldingAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<AdminHoldingAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.records) &&
    Array.isArray(analytics.statusStats)
  )
}

export async function getLatestAdminHoldingUploadBatch(): Promise<AdminHoldingUploadBatchInfo | null> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("admin_holding_upload_batches")
      .select("id, filename, uploaded_by_label, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[admin-holding-records] getLatestAdminHoldingUploadBatch:", error.message)
      throw new Error(error.message)
    }

    return data ? mapBatch(data) : null
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Unable to load admin holding upload status.")
  }
}

async function loadLatestAdminHoldingAnalytics(): Promise<AdminHoldingAnalytics> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("admin_holding_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[admin-holding-records] loadLatestAdminHoldingAnalytics:", error.message)
      return emptyAdminHoldingAnalytics()
    }

    if (!data || !isAdminHoldingAnalytics(data.analytics)) {
      return emptyAdminHoldingAnalytics()
    }

    return {
      ...data.analytics,
      dataSource: data.analytics.dataSource || data.filename,
      lastUpdated: data.created_at ?? data.analytics.lastUpdated,
      dataReady: data.analytics.dataReady,
    }
  } catch (error) {
    console.error(
      "[admin-holding-records] loadLatestAdminHoldingAnalytics:",
      error instanceof Error ? error.message : error,
    )
    return emptyAdminHoldingAnalytics()
  }
}

const getCachedAdminHoldingAnalytics = unstable_cache(
  loadLatestAdminHoldingAnalytics,
  [ADMIN_HOLDING_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [ADMIN_HOLDING_ANALYTICS_CACHE_TAG],
  },
)

export async function getAdminHoldingAnalytics(): Promise<AdminHoldingAnalytics> {
  return getCachedAdminHoldingAnalytics()
}

export async function replaceAdminHoldingWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceAdminHoldingWorkbookInput): Promise<ReplaceAdminHoldingWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildAdminHoldingAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na admin holding data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("admin_holding_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create admin holding upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("admin_holding_upload_batches")
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
