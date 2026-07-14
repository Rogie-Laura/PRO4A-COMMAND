import { unstable_cache } from "next/cache"

import { buildRprmdWorkbookPayload } from "@/lib/rprmd-workbook-analytics"
import type { DetailedPersonnelRecord, DetailedPersonnelTabKey } from "@/lib/detailed-personnel-types"
import type { PersonnelRecord } from "@/lib/personnel-types"
import type {
  ParsedRprmdWorkbook,
  RprmdWorkbookPayload,
  RprmdWorkbookUploadBatchInfo,
} from "@/lib/rprmd-workbook-types"
import type { SchoolingRecord } from "@/lib/schooling-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const RPRMD_WORKBOOK_CACHE_TAG = "rprmd-workbook-v1"

export type RprmdWorkbookMetaChunk = {
  alphalistSheetName: string
  mandatorySchooling: SchoolingRecord[]
  specializedSchooling: SchoolingRecord[]
  detailed: Record<DetailedPersonnelTabKey, DetailedPersonnelRecord[]>
}

type ReplaceRprmdWorkbookInput = {
  filename: string
  uploadedByLabel: string
  workbook: ParsedRprmdWorkbook
}

export type ReplaceRprmdWorkbookResult = {
  batch: RprmdWorkbookUploadBatchInfo
  payload: RprmdWorkbookPayload
  alphalistSheetName: string
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

async function findLatestCompleteBatchRow() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rprmd_workbook_upload_batches")
    .select("id, filename, uploaded_by_label, created_at, analytics")
    .order("created_at", { ascending: false })
    .limit(12)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).find((row) => isRprmdWorkbookPayload(row.analytics)) ?? null
}

export async function getLatestRprmdWorkbookUploadBatch(): Promise<RprmdWorkbookUploadBatchInfo | null> {
  try {
    const row = await findLatestCompleteBatchRow()
    return row ? mapBatch(row) : null
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Unable to load RPRMD workbook upload status.")
  }
}

async function loadLatestRprmdWorkbookPayload(): Promise<RprmdWorkbookPayload | null> {
  try {
    const row = await findLatestCompleteBatchRow()
    if (!row || !isRprmdWorkbookPayload(row.analytics)) {
      return null
    }

    return {
      ...row.analytics,
      fileName: row.analytics.fileName || row.filename,
      lastUpdated: row.created_at ?? row.analytics.lastUpdated,
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

export async function beginRprmdWorkbookUploadBatch(
  filename: string,
  uploadedByLabel: string,
): Promise<RprmdWorkbookUploadBatchInfo> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rprmd_workbook_upload_batches")
    .insert({
      filename,
      uploaded_by_label: uploadedByLabel,
      analytics: { status: "uploading" },
    })
    .select("id, filename, uploaded_by_label, created_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create RPRMD workbook upload batch.")
  }

  return mapBatch(data)
}

export async function appendRprmdPersonnelChunk(batchId: string, records: PersonnelRecord[]) {
  if (records.length === 0) return

  const supabase = createAdminClient()
  const { count, error: countError } = await supabase
    .from("rprmd_workbook_upload_parts")
    .select("id", { count: "exact", head: true })
    .eq("batch_id", batchId)
    .eq("part_type", "personnel")

  if (countError) {
    throw new Error(countError.message)
  }

  const { error } = await supabase.from("rprmd_workbook_upload_parts").insert({
    batch_id: batchId,
    part_type: "personnel",
    part_index: count ?? 0,
    data: records,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function appendRprmdWorkbookMeta(batchId: string, meta: RprmdWorkbookMetaChunk) {
  const supabase = createAdminClient()

  const { error: deleteError } = await supabase
    .from("rprmd_workbook_upload_parts")
    .delete()
    .eq("batch_id", batchId)
    .eq("part_type", "meta")

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const { error } = await supabase.from("rprmd_workbook_upload_parts").insert({
    batch_id: batchId,
    part_type: "meta",
    part_index: 0,
    data: meta,
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function loadParsedWorkbookFromParts(batchId: string): Promise<ParsedRprmdWorkbook> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rprmd_workbook_upload_parts")
    .select("part_type, part_index, data")
    .eq("batch_id", batchId)
    .order("part_type", { ascending: true })
    .order("part_index", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error("Walang na-upload na workbook parts para sa batch na ito.")
  }

  const personnelRecords: PersonnelRecord[] = []
  let meta: RprmdWorkbookMetaChunk | null = null

  for (const part of data) {
    if (part.part_type === "personnel" && Array.isArray(part.data)) {
      personnelRecords.push(...(part.data as PersonnelRecord[]))
      continue
    }

    if (part.part_type === "meta" && part.data && typeof part.data === "object") {
      meta = part.data as RprmdWorkbookMetaChunk
    }
  }

  if (!meta) {
    throw new Error("Kulang ang workbook metadata sa upload.")
  }

  if (personnelRecords.length === 0) {
    throw new Error("Walang personnel records na na-upload.")
  }

  return {
    alphalistSheetName: meta.alphalistSheetName,
    personnelRecords,
    mandatorySchooling: meta.mandatorySchooling,
    specializedSchooling: meta.specializedSchooling,
    detailed: meta.detailed,
  }
}

export async function abortRprmdWorkbookUploadBatch(batchId: string) {
  const supabase = createAdminClient()
  await supabase.from("rprmd_workbook_upload_batches").delete().eq("id", batchId)
}

export async function finalizeRprmdWorkbookUploadBatch(
  batchId: string,
): Promise<ReplaceRprmdWorkbookResult> {
  const supabase = createAdminClient()
  const { data: batch, error: batchError } = await supabase
    .from("rprmd_workbook_upload_batches")
    .select("id, filename, uploaded_by_label, created_at")
    .eq("id", batchId)
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Unable to load RPRMD workbook upload batch.")
  }

  const workbook = await loadParsedWorkbookFromParts(batchId)
  const payload = buildRprmdWorkbookPayload(workbook, {
    fileName: batch.filename,
    lastUpdated: batch.created_at,
  })

  const { error: updateError } = await supabase
    .from("rprmd_workbook_upload_batches")
    .update({ analytics: payload })
    .eq("id", batchId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  const { error: partsCleanupError } = await supabase
    .from("rprmd_workbook_upload_parts")
    .delete()
    .eq("batch_id", batchId)

  if (partsCleanupError) {
    throw new Error(partsCleanupError.message)
  }

  const { error: batchCleanupError } = await supabase
    .from("rprmd_workbook_upload_batches")
    .delete()
    .neq("id", batchId)

  if (batchCleanupError) {
    throw new Error(batchCleanupError.message)
  }

  return {
    batch: mapBatch(batch),
    payload: {
      ...payload,
      lastUpdated: batch.created_at,
    },
    alphalistSheetName: workbook.alphalistSheetName,
  }
}

export async function replaceRprmdWorkbook({
  filename,
  uploadedByLabel,
  workbook,
}: ReplaceRprmdWorkbookInput): Promise<ReplaceRprmdWorkbookResult> {
  const batch = await beginRprmdWorkbookUploadBatch(filename, uploadedByLabel)

  try {
    const chunkSize = 500
    for (let index = 0; index < workbook.personnelRecords.length; index += chunkSize) {
      await appendRprmdPersonnelChunk(
        batch.id,
        workbook.personnelRecords.slice(index, index + chunkSize),
      )
    }

    await appendRprmdWorkbookMeta(batch.id, {
      alphalistSheetName: workbook.alphalistSheetName,
      mandatorySchooling: workbook.mandatorySchooling,
      specializedSchooling: workbook.specializedSchooling,
      detailed: workbook.detailed,
    })

    return await finalizeRprmdWorkbookUploadBatch(batch.id)
  } catch (error) {
    await abortRprmdWorkbookUploadBatch(batch.id)
    throw error
  }
}
