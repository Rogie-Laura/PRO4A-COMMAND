import { unstable_cache } from "next/cache"

import {
  buildCriminalGangsAnalyticsFromWorkbook,
  emptyCriminalGangsAnalytics,
} from "@/lib/criminal-gangs-analytics"
import type {
  CriminalGangsAnalytics,
  CriminalGangsUploadBatchInfo,
  ParsedCriminalGangsWorkbook,
} from "@/lib/criminal-gangs-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const CRIMINAL_GANGS_ANALYTICS_CACHE_TAG = "criminal-gangs-analytics-v1"

type ReplaceCriminalGangsWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedCriminalGangsWorkbook
}

export type ReplaceCriminalGangsWorkbookResult = {
  batch: CriminalGangsUploadBatchInfo
  analytics: CriminalGangsAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): CriminalGangsUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isCriminalGangsAnalytics(value: unknown): value is CriminalGangsAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<CriminalGangsAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    typeof analytics.title === "string"
  )
}

export async function getLatestCriminalGangsUploadBatch(): Promise<CriminalGangsUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("criminal_gangs_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestCriminalGangsAnalytics(): Promise<CriminalGangsAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("criminal_gangs_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isCriminalGangsAnalytics(data.analytics)) {
    return emptyCriminalGangsAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedCriminalGangsAnalytics = unstable_cache(
  loadLatestCriminalGangsAnalytics,
  [CRIMINAL_GANGS_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [CRIMINAL_GANGS_ANALYTICS_CACHE_TAG],
  },
)

export async function getCriminalGangsAnalytics(): Promise<CriminalGangsAnalytics> {
  return getCachedCriminalGangsAnalytics()
}

export async function replaceCriminalGangsWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceCriminalGangsWorkbookInput): Promise<ReplaceCriminalGangsWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildCriminalGangsAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na criminal gangs data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("criminal_gangs_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create criminal gangs upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("criminal_gangs_upload_batches")
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
