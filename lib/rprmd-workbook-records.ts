import { unstable_cache } from "next/cache"

import { buildRprmdWorkbookPayload } from "@/lib/rprmd-workbook-analytics"
import type {
  ParsedRprmdWorkbook,
  RprmdWorkbookPayload,
  RprmdWorkbookUploadBatchInfo,
} from "@/lib/rprmd-workbook-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const RPRMD_WORKBOOK_CACHE_TAG = "rprmd-workbook-v1"

type ReplaceRprmdWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedRprmdWorkbook
}

export type ReplaceRprmdWorkbookResult = {
  batch: RprmdWorkbookUploadBatchInfo
  payload: RprmdWorkbookPayload
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): RprmdWorkbookUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isRprmdWorkbookPayload(value: unknown): value is RprmdWorkbookPayload {
  if (!value || typeof value !== "object") return false

  const payload = value as Partial<RprmdWorkbookPayload>
  return Boolean(
    payload.personnel &&
      Array.isArray(payload.personnelRecords) &&
      payload.mandatorySchooling &&
      payload.specializedSchooling &&
      payload.detailed &&
      payload.detailedDashboard,
  )
}

export async function getLatestRprmdWorkbookUploadBatch(): Promise<RprmdWorkbookUploadBatchInfo | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("rprmd_workbook_upload_batches")
      .select("id, filename, uploaded_by_label, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? mapBatch(data) : null
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Unable to load RPRMD workbook upload status.")
  }
}

async function loadLatestRprmdWorkbookPayload(): Promise<RprmdWorkbookPayload | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("rprmd_workbook_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[rprmd-workbook-records] loadLatestRprmdWorkbookPayload:", error.message)
      return null
    }

    if (!data || !isRprmdWorkbookPayload(data.analytics)) {
      return null
    }

    return {
      ...data.analytics,
      fileName: data.analytics.fileName || data.filename,
      lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    }
  } catch (error) {
    console.error(
      "[rprmd-workbook-records] loadLatestRprmdWorkbookPayload:",
      error instanceof Error ? error.message : error,
    )
    return null
  }
}

const getCachedRprmdWorkbookPayload = unstable_cache(
  loadLatestRprmdWorkbookPayload,
  [RPRMD_WORKBOOK_CACHE_TAG],
  {
    revalidate: false,
    tags: [RPRMD_WORKBOOK_CACHE_TAG],
  },
)

export async function getRprmdWorkbookPayload(): Promise<RprmdWorkbookPayload | null> {
  return getCachedRprmdWorkbookPayload()
}

export async function replaceRprmdWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceRprmdWorkbookInput): Promise<ReplaceRprmdWorkbookResult> {
  const supabase = createAdminClient()
  const payload = buildRprmdWorkbookPayload(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  const { data: batch, error: batchError } = await supabase
    .from("rprmd_workbook_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics: payload,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create RPRMD workbook upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("rprmd_workbook_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
    payload: {
      ...payload,
      lastUpdated: batch.created_at,
    },
  }
}
