import { unstable_cache } from "next/cache"

import {
  buildFirearmsAnalyticsFromWorkbook,
  emptyFirearmsAnalytics,
  FIREARMS_ANALYTICS_CACHE_TAG,
} from "@/lib/firearms-analytics"
import type { FirearmsAnalytics, FirearmsUploadBatchInfo } from "@/lib/firearms-types"
import type { ParsedFirearmsWorkbook } from "@/lib/firearms-xlsx-parser"
import { createAdminClient } from "@/lib/supabase/admin"

type ReplaceFirearmsWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedFirearmsWorkbook
}

export type ReplaceFirearmsWorkbookResult = {
  batch: FirearmsUploadBatchInfo
}

type StoredFirearmsBatchRow = {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
  analytics: unknown
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): FirearmsUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isFirearmsAnalytics(value: unknown): value is FirearmsAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<FirearmsAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    !!analytics.shortFirearms &&
    !!analytics.longFirearms
  )
}

export async function getLatestFirearmsUploadBatch(): Promise<FirearmsUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("firearms_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestFirearmsAnalytics(): Promise<FirearmsAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("firearms_upload_batches")
    .select("created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isFirearmsAnalytics(data.analytics)) {
    return emptyFirearmsAnalytics()
  }

  return {
    ...data.analytics,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: true,
  }
}

const getCachedFirearmsAnalytics = unstable_cache(
  loadLatestFirearmsAnalytics,
  ["firearms-analytics"],
  {
    revalidate: false,
    tags: [FIREARMS_ANALYTICS_CACHE_TAG],
  },
)

export async function getFirearmsAnalytics(): Promise<FirearmsAnalytics> {
  return getCachedFirearmsAnalytics()
}

export async function replaceFirearmsWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceFirearmsWorkbookInput): Promise<ReplaceFirearmsWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildFirearmsAnalyticsFromWorkbook(workbook)

  const { data: batch, error: batchError } = await supabase
    .from("firearms_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create firearms upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("firearms_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
  }
}

export function parseStoredFirearmsAnalytics(row: StoredFirearmsBatchRow | null | undefined) {
  if (!row || !isFirearmsAnalytics(row.analytics)) {
    return emptyFirearmsAnalytics()
  }

  return {
    ...row.analytics,
    lastUpdated: row.created_at ?? row.analytics.lastUpdated,
    dataReady: true,
  }
}
