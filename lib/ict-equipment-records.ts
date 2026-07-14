import { unstable_cache } from "next/cache"

import { buildIctEquipmentAnalyticsFromWorkbook } from "@/lib/ict-equipment-parse"
import type {
  IctEquipmentAnalytics,
  IctEquipmentUploadBatchInfo,
  ParsedIctRecapWorkbook,
} from "@/lib/ict-equipment-types"
import { emptyIctEquipmentAnalytics } from "@/lib/ict-equipment-parse"
import { createAdminClient } from "@/lib/supabase/admin"

export const ICT_EQUIPMENT_ANALYTICS_CACHE_TAG = "ict-equipment-analytics-recap-v8"

type ReplaceIctEquipmentWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedIctRecapWorkbook
}

export type ReplaceIctEquipmentWorkbookResult = {
  batch: IctEquipmentUploadBatchInfo
  analytics: IctEquipmentAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): IctEquipmentUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isIctEquipmentAnalytics(value: unknown): value is IctEquipmentAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<IctEquipmentAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    analytics.grandTotal !== undefined &&
    analytics.serviceable !== undefined
  )
}

export async function getLatestIctEquipmentUploadBatch(): Promise<IctEquipmentUploadBatchInfo | null> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("ict_equipment_upload_batches")
      .select("id, filename, uploaded_by_label, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[ict-equipment-records] getLatestIctEquipmentUploadBatch:", error.message)
      throw new Error(error.message)
    }

    return data ? mapBatch(data) : null
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Unable to load ICT equipment upload status.")
  }
}

async function loadLatestIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("ict_equipment_upload_batches")
      .select("filename, created_at, analytics")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[ict-equipment-records] loadLatestIctEquipmentAnalytics:", error.message)
      return emptyIctEquipmentAnalytics()
    }

    if (!data || !isIctEquipmentAnalytics(data.analytics)) {
      return emptyIctEquipmentAnalytics()
    }

    return {
      ...data.analytics,
      dataSource: data.analytics.dataSource || data.filename,
      lastUpdated: data.created_at ?? data.analytics.lastUpdated,
      dataReady: data.analytics.dataReady,
    }
  } catch (error) {
    console.error(
      "[ict-equipment-records] loadLatestIctEquipmentAnalytics:",
      error instanceof Error ? error.message : error,
    )
    return emptyIctEquipmentAnalytics()
  }
}

const getCachedIctEquipmentAnalytics = unstable_cache(
  loadLatestIctEquipmentAnalytics,
  [ICT_EQUIPMENT_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [ICT_EQUIPMENT_ANALYTICS_CACHE_TAG],
  },
)

export async function getIctEquipmentAnalytics(): Promise<IctEquipmentAnalytics> {
  return getCachedIctEquipmentAnalytics()
}

export async function replaceIctEquipmentWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceIctEquipmentWorkbookInput): Promise<ReplaceIctEquipmentWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildIctEquipmentAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na ICT RECAP data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("ict_equipment_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create ICT equipment upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("ict_equipment_upload_batches")
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
