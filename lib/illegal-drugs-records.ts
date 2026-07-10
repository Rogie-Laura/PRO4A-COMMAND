import { unstable_cache } from "next/cache"

import {
  buildIllegalDrugsAnalyticsFromWorkbook,
  emptyIllegalDrugsAnalytics,
} from "@/lib/illegal-drugs-analytics"
import type {
  IllegalDrugsAnalytics,
  IllegalDrugsUploadBatchInfo,
  ParsedIllegalDrugsWorkbook,
} from "@/lib/illegal-drugs-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const ILLEGAL_DRUGS_ANALYTICS_CACHE_TAG = "illegal-drugs-analytics-v2"

type ReplaceIllegalDrugsWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedIllegalDrugsWorkbook
}

export type ReplaceIllegalDrugsWorkbookResult = {
  batch: IllegalDrugsUploadBatchInfo
  analytics: IllegalDrugsAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): IllegalDrugsUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isIllegalDrugsAnalytics(value: unknown): value is IllegalDrugsAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<IllegalDrugsAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    (analytics.hvi === null || typeof analytics.hvi === "object") &&
    (analytics.sli === null || typeof analytics.sli === "object")
  )
}

export async function getLatestIllegalDrugsUploadBatch(): Promise<IllegalDrugsUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("illegal_drugs_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestIllegalDrugsAnalytics(): Promise<IllegalDrugsAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("illegal_drugs_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isIllegalDrugsAnalytics(data.analytics)) {
    return emptyIllegalDrugsAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedIllegalDrugsAnalytics = unstable_cache(
  loadLatestIllegalDrugsAnalytics,
  [ILLEGAL_DRUGS_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [ILLEGAL_DRUGS_ANALYTICS_CACHE_TAG],
  },
)

export async function getIllegalDrugsAnalytics(): Promise<IllegalDrugsAnalytics> {
  return getCachedIllegalDrugsAnalytics()
}

export async function replaceIllegalDrugsWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceIllegalDrugsWorkbookInput): Promise<ReplaceIllegalDrugsWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildIllegalDrugsAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na illegal drugs data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("illegal_drugs_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create illegal drugs upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("illegal_drugs_upload_batches")
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
