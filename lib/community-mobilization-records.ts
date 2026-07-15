import { unstable_cache } from "next/cache"

import {
  buildCommunityMobilizationAnalyticsFromWorkbook,
  emptyCommunityMobilizationAnalytics,
} from "@/lib/community-mobilization-analytics"
import type {
  CommunityMobilizationAnalytics,
  CommunityMobilizationUploadBatchInfo,
  ParsedCommunityMobilizationWorkbook,
} from "@/lib/community-mobilization-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const COMMUNITY_MOBILIZATION_ANALYTICS_CACHE_TAG = "community-mobilization-analytics-v1"

type ReplaceCommunityMobilizationWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedCommunityMobilizationWorkbook
}

export type ReplaceCommunityMobilizationWorkbookResult = {
  batch: CommunityMobilizationUploadBatchInfo
  analytics: CommunityMobilizationAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): CommunityMobilizationUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isCommunityMobilizationAnalytics(
  value: unknown,
): value is CommunityMobilizationAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<CommunityMobilizationAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.recap) &&
    Array.isArray(analytics.provinces)
  )
}

export async function getLatestCommunityMobilizationUploadBatch(): Promise<CommunityMobilizationUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("community_mobilization_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestCommunityMobilizationAnalytics(): Promise<CommunityMobilizationAnalytics> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("community_mobilization_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(
        "[community-mobilization-records] loadLatestCommunityMobilizationAnalytics:",
        error.message,
      )
      return emptyCommunityMobilizationAnalytics()
    }

    if (!data || !isCommunityMobilizationAnalytics(data.analytics)) {
      return emptyCommunityMobilizationAnalytics()
    }

    return {
      ...data.analytics,
      fileName: data.analytics.fileName || data.filename,
      lastUpdated: data.created_at ?? data.analytics.lastUpdated,
      dataReady: data.analytics.dataReady,
    }
  } catch (error) {
    console.error(
      "[community-mobilization-records] loadLatestCommunityMobilizationAnalytics:",
      error instanceof Error ? error.message : error,
    )
    return emptyCommunityMobilizationAnalytics()
  }
}

const getCachedCommunityMobilizationAnalytics = unstable_cache(
  loadLatestCommunityMobilizationAnalytics,
  [COMMUNITY_MOBILIZATION_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [COMMUNITY_MOBILIZATION_ANALYTICS_CACHE_TAG],
  },
)

export async function getCommunityMobilizationAnalytics(): Promise<CommunityMobilizationAnalytics> {
  return getCachedCommunityMobilizationAnalytics()
}

export async function replaceCommunityMobilizationWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceCommunityMobilizationWorkbookInput): Promise<ReplaceCommunityMobilizationWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildCommunityMobilizationAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na Community Mobilization data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("community_mobilization_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(
      batchError?.message ?? "Unable to create Community Mobilization upload batch.",
    )
  }

  const { error: cleanupError } = await supabase
    .from("community_mobilization_upload_batches")
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
