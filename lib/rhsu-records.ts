import { unstable_cache } from "next/cache"

import { emptyRhsuAnalytics } from "@/lib/rhsu-xlsx-parser"
import type {
  ParsedRhsuWorkbook,
  RhsuAnalytics,
  RhsuUploadBatchInfo,
} from "@/lib/rhsu-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const RHSU_ANALYTICS_CACHE_TAG = "rhsu-analytics-v1"

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): RhsuUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isRhsuAnalytics(value: unknown): value is RhsuAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<RhsuAnalytics>
  return (
    analytics.dataReady === true &&
    Array.isArray(analytics.decalsByMonth) &&
    Array.isArray(analytics.purcsByMonth) &&
    analytics.decalsTotals !== undefined &&
    analytics.decalStatus !== undefined
  )
}

export async function getLatestRhsuUploadBatch(): Promise<RhsuUploadBatchInfo | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rhsu_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestRhsuAnalytics(): Promise<RhsuAnalytics> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("rhsu_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data || !isRhsuAnalytics(data.analytics)) {
      if (error) {
        console.error("[rhsu-records] loadLatestRhsuAnalytics:", error.message)
      }
      return emptyRhsuAnalytics()
    }

    return {
      ...data.analytics,
      dataSource: data.filename,
      lastUpdated: data.created_at,
    }
  } catch (error) {
    console.error(
      "[rhsu-records] loadLatestRhsuAnalytics:",
      error instanceof Error ? error.message : error,
    )
    return emptyRhsuAnalytics()
  }
}

const getCachedRhsuAnalytics = unstable_cache(
  loadLatestRhsuAnalytics,
  [RHSU_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [RHSU_ANALYTICS_CACHE_TAG],
  },
)

export async function getRhsuAnalytics() {
  return getCachedRhsuAnalytics()
}

export async function replaceRhsuWorkbook(input: {
  filename: string
  uploadedByLabel: string
  workbook: ParsedRhsuWorkbook
}) {
  const supabase = createAdminClient()
  const analytics: RhsuAnalytics = {
    ...input.workbook.analytics,
    dataSource: input.filename,
    lastUpdated: new Date().toISOString(),
  }

  const { data: batch, error: batchError } = await supabase
    .from("rhsu_upload_batches")
    .insert({
      filename: input.filename,
      uploaded_by_label: input.uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create RHSU upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("rhsu_upload_batches")
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
