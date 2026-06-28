"use server"

import { revalidatePath, updateTag } from "next/cache"

import {
  createAccessToken,
  getAccessTokenLoginUrl,
  listAccessTokens,
  revokeAccessToken,
} from "@/lib/access-tokens"
import { requireSuperAdminSession } from "@/lib/auth/get-session"
import type { AccessKeyRole } from "@/lib/auth/roles"
import { getLatestBmiUploadBatch, replaceBmiRecords } from "@/lib/bmi-records"
import { parseBmiXlsx } from "@/lib/bmi-xlsx-parser"
import { HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"

const MAX_BMI_UPLOAD_BYTES = 15 * 1024 * 1024

export async function getAccessTokensAction() {
  await requireSuperAdminSession()
  return listAccessTokens()
}

export async function createAccessTokenAction(
  label: string,
  role: AccessKeyRole,
  officerExpirationDays?: number,
) {
  await requireSuperAdminSession()

  const trimmed = label.trim()

  if (!trimmed) {
    throw new Error("Label is required.")
  }

  if (trimmed.length > 80) {
    throw new Error("Label must be 80 characters or less.")
  }

  const result = await createAccessToken({
    label: trimmed,
    role,
    officerExpirationDays,
  })
  revalidatePath("/settings")
  return result
}

export async function getAccessTokenQrUrlAction(id: string) {
  await requireSuperAdminSession()

  if (!id) {
    throw new Error("Token id is required.")
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://pro4a-command.vercel.app")

  return getAccessTokenLoginUrl(id, origin)
}

export async function revokeAccessTokenAction(id: string) {
  await requireSuperAdminSession()

  if (!id) {
    throw new Error("Token id is required.")
  }

  await revokeAccessToken(id)
  revalidatePath("/settings")
}

export async function getLatestBmiUploadBatchAction() {
  await requireSuperAdminSession()
  return getLatestBmiUploadBatch()
}

export async function uploadBmiRecordsAction(formData: FormData) {
  const session = await requireSuperAdminSession()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    throw new Error("Pumili ng Excel file (.xlsx).")
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Excel (.xlsx) lang ang tinatanggap.")
  }

  if (file.size === 0) {
    throw new Error("Walang laman ang file.")
  }

  if (file.size > MAX_BMI_UPLOAD_BYTES) {
    throw new Error("Mas malaki sa 15 MB ang file. Hatiin o i-compress muna.")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const parsed = parseBmiXlsx(buffer)
  const result = await replaceBmiRecords({
    filename: file.name,
    uploadedByLabel: session.label,
    records: parsed.records,
  })

  updateTag(HEALTH_ANALYTICS_CACHE_TAG)
  revalidatePath("/settings")
  revalidatePath("/health-and-bmi")

  return {
    batch: result.batch,
    insertedCount: result.insertedCount,
    skippedRows: parsed.skippedRows,
    categoryPreview: parsed.categoryPreview,
  }
}
