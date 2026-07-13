import { unstable_cache } from "next/cache"

import {
  buildDrugClearingAnalyticsFromWorkbook,
  emptyDrugClearingAnalytics,
} from "@/lib/drug-clearing-analytics"
import type {
  DrugClearingAnalytics,
  DrugClearingUploadBatchInfo,
  ParsedDrugClearingWorkbook,
} from "@/lib/drug-clearing-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const DRUG_CLEARING_ANALYTICS_CACHE_TAG = "drug-clearing-analytics-v1"

type ReplaceDrugClearingWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedDrugClearingWorkbook
}

export type ReplaceDrugClearingWorkbookResult = {
  batch: DrugClearingUploadBatchInfo
  analytics: DrugClearingAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): DrugClearingUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isDrugClearingAnalytics(value: unknown): value is DrugClearingAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<DrugClearingAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.recap) &&
    Array.isArray(analytics.provinces)
  )
}

export async function getLatestDrugClearingUploadBatch(): Promise<DrugClearingUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("drug_clearing_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestDrugClearingAnalytics(): Promise<DrugClearingAnalytics> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("drug_clearing_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[drug-clearing-records] loadLatestDrugClearingAnalytics:", error.message)
      return emptyDrugClearingAnalytics()
    }

    if (!data || !isDrugClearingAnalytics(data.analytics)) {
      return emptyDrugClearingAnalytics()
    }

    return {
      ...data.analytics,
      fileName: data.analytics.fileName || data.filename,
      lastUpdated: data.created_at ?? data.analytics.lastUpdated,
      dataReady: data.analytics.dataReady,
    }
  } catch (error) {
    console.error(
      "[drug-clearing-records] loadLatestDrugClearingAnalytics:",
      error instanceof Error ? error.message : error,
    )
    return emptyDrugClearingAnalytics()
  }
}

const getCachedDrugClearingAnalytics = unstable_cache(
  loadLatestDrugClearingAnalytics,
  [DRUG_CLEARING_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [DRUG_CLEARING_ANALYTICS_CACHE_TAG],
  },
)

export async function getDrugClearingAnalytics(): Promise<DrugClearingAnalytics> {
  return getCachedDrugClearingAnalytics()
}

export async function replaceDrugClearingWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceDrugClearingWorkbookInput): Promise<ReplaceDrugClearingWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildDrugClearingAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na drug clearing data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("drug_clearing_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create drug clearing upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("drug_clearing_upload_batches")
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
