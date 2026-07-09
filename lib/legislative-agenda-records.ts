import { unstable_cache } from "next/cache"

import {
  buildLegislativeAgendaAnalyticsFromWorkbook,
  emptyLegislativeAgendaAnalytics,
} from "@/lib/legislative-agenda-analytics"
import type {
  LegislativeAgendaAnalytics,
  LegislativeAgendaUploadBatchInfo,
  ParsedLegislativeAgendaWorkbook,
} from "@/lib/legislative-agenda-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const LEGISLATIVE_AGENDA_ANALYTICS_CACHE_TAG = "legislative-agenda-analytics-v1"

type ReplaceLegislativeAgendaWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedLegislativeAgendaWorkbook
}

export type ReplaceLegislativeAgendaWorkbookResult = {
  batch: LegislativeAgendaUploadBatchInfo
  analytics: LegislativeAgendaAnalytics
}

function mapBatch(row: {
  id: string
  filename: string
  uploaded_by_label: string | null
  created_at: string
}): LegislativeAgendaUploadBatchInfo {
  return {
    id: row.id,
    filename: row.filename,
    uploadedByLabel: row.uploaded_by_label,
    createdAt: row.created_at,
  }
}

function isLegislativeAgendaAnalytics(value: unknown): value is LegislativeAgendaAnalytics {
  if (!value || typeof value !== "object") return false

  const analytics = value as Partial<LegislativeAgendaAnalytics>
  return (
    typeof analytics.lastUpdated === "string" &&
    typeof analytics.dataReady === "boolean" &&
    Array.isArray(analytics.items)
  )
}

export async function getLatestLegislativeAgendaUploadBatch(): Promise<LegislativeAgendaUploadBatchInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("legislative_agenda_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapBatch(data) : null
}

async function loadLatestLegislativeAgendaAnalytics(): Promise<LegislativeAgendaAnalytics> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("legislative_agenda_upload_batches")
    .select("filename, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isLegislativeAgendaAnalytics(data.analytics)) {
    return emptyLegislativeAgendaAnalytics()
  }

  return {
    ...data.analytics,
    fileName: data.analytics.fileName || data.filename,
    lastUpdated: data.created_at ?? data.analytics.lastUpdated,
    dataReady: data.analytics.dataReady,
  }
}

const getCachedLegislativeAgendaAnalytics = unstable_cache(
  loadLatestLegislativeAgendaAnalytics,
  [LEGISLATIVE_AGENDA_ANALYTICS_CACHE_TAG],
  {
    revalidate: false,
    tags: [LEGISLATIVE_AGENDA_ANALYTICS_CACHE_TAG],
  },
)

export async function getLegislativeAgendaAnalytics(): Promise<LegislativeAgendaAnalytics> {
  return getCachedLegislativeAgendaAnalytics()
}

export async function replaceLegislativeAgendaWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceLegislativeAgendaWorkbookInput): Promise<ReplaceLegislativeAgendaWorkbookResult> {
  const supabase = createAdminClient()
  const analytics = buildLegislativeAgendaAnalyticsFromWorkbook(workbook, {
    fileName: filename,
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error("Walang valid na legislative agenda data sa workbook.")
  }

  const { data: batch, error: batchError } = await supabase
    .from("legislative_agenda_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics,
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to create legislative agenda upload batch.")
  }

  const { error: cleanupError } = await supabase
    .from("legislative_agenda_upload_batches")
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
