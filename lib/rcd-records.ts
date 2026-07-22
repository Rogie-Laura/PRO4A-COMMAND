import { unstable_cache } from "next/cache"

import { emptyRcdAnalytics } from "@/lib/rcd-xlsx-parser"
import type {
  ParsedRcdWorkbook,
  RcdAnalytics,
  RcdUploadBatchInfo,
} from "@/lib/rcd-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const RCD_ANALYTICS_CACHE_TAG = "rcd-analytics-v1"

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): RcdUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isRcdAnalytics(value: unknown): value is RcdAnalytics {
  if (!value || typeof value !== "object") return false
  const analytics = value as Partial<RcdAnalytics>
  return analytics.dataReady === true && Array.isArray(analytics.years)
}

export async function getLatestRcdUploadBatch(): Promise<RcdUploadBatchInfo | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rcd_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestRcdAnalytics(): Promise<RcdAnalytics> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("rcd_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data || !isRcdAnalytics(data.analytics)) {
      if (error) {
        console.error("[rcd-records] loadLatestRcdAnalytics:", error.message)
      }
      return emptyRcdAnalytics()
    }

    return {
      ...data.analytics,
      dataSource: data.filename,
      lastUpdated: data.created_at,
    }
  } catch (error) {
    console.error(
      "[rcd-records] loadLatestRcdAnalytics:",
      error instanceof Error ? error.message : error,
    )
    return emptyRcdAnalytics()
  }
}

const getCachedRcdAnalytics = unstable_cache(loadLatestRcdAnalytics, [RCD_ANALYTICS_CACHE_TAG], {
  revalidate: false,
  tags: [RCD_ANALYTICS_CACHE_TAG],
})

export async function getRcdAnalytics() {
  return getCachedRcdAnalytics()
}

export async function replaceRcdWorkbook(input: {
  filename: string
  uploadedByLabel: string
  workbook: ParsedRcdWorkbook
}) {
  const supabase = createAdminClient()
  const analytics: RcdAnalytics = {
    ...input.workbook.analytics,
    dataSource: input.filename,
    lastUpdated: new Date().toISOString(),
  }

  const { data: batch, error: batchError } = await supabase
    .from("rcd_upload_batches")
    .insert({
      filename: input.filename,
      uploaded_by_label: input.uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create RCD upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("rcd_upload_batches")
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
