import { unstable_cache } from "next/cache"

import {
  buildRandomDrugTestAnalyticsFromWorkbook,
  emptyRandomDrugTestAnalytics,
} from "@/lib/random-drug-test-analytics"
import type {
  ParsedRandomDrugTestWorkbook,
  RandomDrugTestAnalytics,
  RandomDrugTestUploadBatchInfo,
} from "@/lib/random-drug-test-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const RANDOM_DRUG_TEST_ANALYTICS_CACHE_TAG = "random-drug-test-analytics-v1"

type ReplaceRandomDrugTestWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedRandomDrugTestWorkbook
}

export type ReplaceRandomDrugTestWorkbookResult = {
  batch: RandomDrugTestUploadBatchInfo
  analytics: RandomDrugTestAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): RandomDrugTestUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isRandomDrugTestAnalytics(value: unknown): value is RandomDrugTestAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<RandomDrugTestAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.rows)
  )
}

export async function getLatestRandomDrugTestUploadBatch(): Promise<RandomDrugTestUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("random_drug_test_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestRandomDrugTestAnalytics(): Promise<RandomDrugTestAnalytics> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("random_drug_test_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[random-drug-test-records] loadLatest:", error.message)
      return emptyRandomDrugTestAnalytics()
    }

    if (!data || !isRandomDrugTestAnalytics(data.analytics)) {
      return emptyRandomDrugTestAnalytics()
    }

    return {
      ...data.analytics,
      fileName: data.analytics.fileName || data.filename,
      lastUpdated: data.created_at ?? data.analytics.lastUpdated,
      dataReady: data.analytics.dataReady,
    }
  } catch (error) {
    console.error(
      "[random-drug-test-records] loadLatest:",
      error instanceof Error ? error.message : error,
    )
    return emptyRandomDrugTestAnalytics()
  }
}

const getCachedRandomDrugTestAnalytics = unstable_cache(
  loadLatestRandomDrugTestAnalytics,
  [RANDOM_DRUG_TEST_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [RANDOM_DRUG_TEST_ANALYTICS_CACHE_TAG],
  },
)

export async function getRandomDrugTestAnalytics(): Promise<RandomDrugTestAnalytics> {
  return getCachedRandomDrugTestAnalytics()
}

export async function replaceRandomDrugTestWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceRandomDrugTestWorkbookInput): Promise<ReplaceRandomDrugTestWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildRandomDrugTestAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na Random Drug Test data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("random_drug_test_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create Random Drug Test upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("random_drug_test_upload_batches")
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
