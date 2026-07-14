import { unstable_cache } from "next/cache"

import {
  buildIntelEligibilityAnalyticsFromWorkbook,
  emptyIntelEligibilityAnalytics,
} from "@/lib/intel-eligibility-analytics"
import type {
  IntelEligibilityAnalytics,
  IntelEligibilityUploadBatchInfo,
  ParsedIntelEligibilityWorkbook,
} from "@/lib/intel-eligibility-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const INTEL_ELIGIBILITY_ANALYTICS_CACHE_TAG = "intel-eligibility-analytics-v1"

type ReplaceIntelEligibilityWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedIntelEligibilityWorkbook
}

export type ReplaceIntelEligibilityWorkbookResult = {
  batch: IntelEligibilityUploadBatchInfo
  analytics: IntelEligibilityAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): IntelEligibilityUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isIntelEligibilityAnalytics(value: unknown): value is IntelEligibilityAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<IntelEligibilityAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.metrics) &&
    Array.isArray(analytics.units)
  )
}

export async function getLatestIntelEligibilityUploadBatch(): Promise<IntelEligibilityUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("intel_eligibility_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestIntelEligibilityAnalytics(): Promise<IntelEligibilityAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("intel_eligibility_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[intel-eligibility-records] loadLatest:", error.message)
    return emptyIntelEligibilityAnalytics()
  }

  if (!data || !isIntelEligibilityAnalytics(data.analytics)) {
    return emptyIntelEligibilityAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedIntelEligibilityAnalytics = unstable_cache(
  loadLatestIntelEligibilityAnalytics,
  [INTEL_ELIGIBILITY_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [INTEL_ELIGIBILITY_ANALYTICS_CACHE_TAG],
  },
)

export async function getIntelEligibilityAnalytics(): Promise<IntelEligibilityAnalytics> {
  return getCachedIntelEligibilityAnalytics()
}

export async function replaceIntelEligibilityWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceIntelEligibilityWorkbookInput): Promise<ReplaceIntelEligibilityWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildIntelEligibilityAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na Intelligence Eligibility data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("intel_eligibility_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create intel eligibility upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("intel_eligibility_upload_batches")
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
