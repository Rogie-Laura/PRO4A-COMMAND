import { unstable_cache } from "next/cache"

import { buildMobilityAnalyticsFromWorkbook } from "@/lib/mobility-clearbook-analytics"
import type {
  MobilityAnalytics,
  MobilityUploadBatchInfo,
  ParsedMobilityWorkbook,
} from "@/lib/mobility-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const MOBILITY_ANALYTICS_CACHE_TAG = "mobility-analytics"

type ReplaceMobilityClearbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedMobilityWorkbook
}

export type ReplaceMobilityClearbookResult = {
  batch: MobilityUploadBatchInfo
}

type StoredMobilityBatchRow = {
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
}): MobilityUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isMobilityAnalytics(value: unknown): value is MobilityAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<MobilityAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.officeBreakdown)
  )
}

export async function getLatestMobilityUploadBatch(): Promise<MobilityUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("mobility_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

export async function loadLatestMobilityUploadAnalytics(): Promise<MobilityAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("mobility_upload_batches")
    .select("created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isMobilityAnalytics(data.analytics)) {
    return {
      lastUpdated: new Date().toISOString(),
      dataReady: false,
      dataSource: "google-sheet",
      clearbookAsOf: null,
      clearbookUnits: [],
      workbook: null,
      totalVehicles: {
        label: "Total Vehicles",
        value: "0",
        detail: "PRO CALABARZON fleet registry",
      },
      officeBreakdown: [],
      ownershipDistribution: [],
      conditionDistribution: [],
      fleet: {
        operational: 0,
        nonOperational: 0,
        byType: [],
        byStatus: [],
      },
    }
  }

  return {
    ...data.analytics,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: true,
    dataSource: "clearbook-upload",
  }
}

const getCachedMobilityUploadAnalytics = unstable_cache(
  loadLatestMobilityUploadAnalytics,
  ["mobility-upload-analytics"],
  {
    revalidate: false,
    tags: [MOBILITY_ANALYTICS_CACHE_TAG],
  },
)

export async function getMobilityUploadAnalytics(): Promise<MobilityAnalytics> {
  return getCachedMobilityUploadAnalytics()
}

export async function replaceMobilityClearbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceMobilityClearbookInput): Promise<ReplaceMobilityClearbookResult> {
  const supabase = createAdminClient()
  const analytics = buildMobilityAnalyticsFromWorkbook(workbook)

  const { data: batch, error: batchError } = await supabase
    .from("mobility_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create mobility upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("mobility_upload_batches")
    .delete()
    .neq("id", batch.id)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  return {
    batch: mapBatch(batch),
  }
}

export function parseStoredMobilityAnalytics(row: StoredMobilityBatchRow | null | undefined) {
  if (!row || !isMobilityAnalytics(row.analytics)) {
    return null
  }

  return {
    ...row.analytics,
    lastUpdated: row.created_at ?? row.analytics.lastUpdated,
    dataReady: true,
    dataSource: "clearbook-upload" as const,
  }
}
