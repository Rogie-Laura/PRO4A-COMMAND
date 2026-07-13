"use server"

import { revalidatePath, updateTag } from "next/cache"

import {
  createAccessToken,
  getAccessTokenLoginUrl,
  listAccessTokens,
  revokeAccessToken,
} from "@/lib/access-tokens"
import { requireSuperAdminSession, requireDivisionUploadSession, requireAlertLevelManageSession } from "@/lib/auth/get-session"
import type { AccessKeyRole } from "@/lib/auth/roles"
import type { DivisionId } from "@/lib/division-scope"
import { getLatestBmiUploadBatch, replaceBmiRecords } from "@/lib/bmi-records"
import { parseBmiXlsx } from "@/lib/bmi-xlsx-parser"
import { CRIME_ANALYTICS_CACHE_TAG } from "@/lib/crime-analytics"
import {
  abortCrimeUploadBatch,
  appendCrimeRecordsChunk,
  beginCrimeUploadBatch,
  finalizeCrimeUploadBatch,
  getLatestCrimeUploadBatch,
  replaceCrimeRecords,
} from "@/lib/crime-records"
import { parseCrimeXlsx, type ParsedCrimeRecord } from "@/lib/crime-xlsx-parser"
import { FIREARMS_ANALYTICS_CACHE_TAG } from "@/lib/firearms-analytics"
import {
  getLatestFirearmsUploadBatch,
  replaceFirearmsWorkbook,
} from "@/lib/firearms-records"
import { parseFirearmsXlsx } from "@/lib/firearms-xlsx-parser"
import { HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"
import { MOBILITY_ANALYTICS_CACHE_TAG } from "@/lib/mobility-records"
import {
  getLatestMobilityUploadBatch,
  replaceMobilityClearbook,
} from "@/lib/mobility-records"
import { parseMobilityWorkbookXlsx } from "@/lib/mobility-xlsx-parser"
import { UPER_ANALYTICS_CACHE_TAG, getLatestUperUploadBatch, replaceUperWorkbook } from "@/lib/uper-records"
import { parseUperXlsx } from "@/lib/uper-xlsx-parser"
import {
  PPO_UPER_ANALYTICS_CACHE_TAG,
  replacePpoUperWorkbook,
} from "@/lib/ppo-uper-records"
import { parsePpoUperXlsx } from "@/lib/ppo-uper-xlsx-parser"
import {
  STATION_CLASSIFICATION_ANALYTICS_CACHE_TAG,
  replaceStationClassificationWorkbook,
} from "@/lib/station-classification-records"
import { parseStationClassificationXlsx } from "@/lib/station-classification-xlsx-parser"
import {
  LEGISLATIVE_AGENDA_ANALYTICS_CACHE_TAG,
  replaceLegislativeAgendaWorkbook,
} from "@/lib/legislative-agenda-records"
import { parseLegislativeAgendaXlsx } from "@/lib/legislative-agenda-xlsx-parser"
import {
  TERRORISM_THREAT_ANALYTICS_CACHE_TAG,
  replaceTerrorismThreatWorkbook,
} from "@/lib/terrorism-threat-records"
import { parseTerrorismThreatXlsx } from "@/lib/terrorism-threat-xlsx-parser"
import {
  RCADD_ANALYTICS_CACHE_TAG,
  replaceRcaddWorkbook,
} from "@/lib/rcadd-accomplishment-records"
import { parseRcaddAccomplishmentXlsx } from "@/lib/rcadd-accomplishment-xlsx-parser"
import {
  ESTABLISHMENT_ANALYTICS_CACHE_TAG,
  replaceEstablishmentWorkbook,
} from "@/lib/establishment-records"
import { parseEstablishmentXlsx } from "@/lib/establishment-xlsx-parser"
import { isAlertLevelId } from "@/lib/alert-level-config"
import {
  ALERT_LEVEL_CACHE_TAG,
  updateAlertLevelSetting,
} from "@/lib/alert-level-records"
import type { AlertLevelId } from "@/lib/alert-level-types"
import {
  ILLEGAL_DRUGS_ANALYTICS_CACHE_TAG,
  replaceIllegalDrugsWorkbook,
} from "@/lib/illegal-drugs-records"
import { parseIllegalDrugsXlsx } from "@/lib/illegal-drugs-xlsx-parser"
import {
  CRIMINAL_GANGS_ANALYTICS_CACHE_TAG,
  replaceCriminalGangsWorkbook,
} from "@/lib/criminal-gangs-records"
import { parseCriminalGangsXlsx } from "@/lib/criminal-gangs-xlsx-parser"
import {
  SURRENDERED_CTGF_ANALYTICS_CACHE_TAG,
  replaceSurrenderedCtgfWorkbook,
} from "@/lib/surrendered-ctgf-records"
import { parseSurrenderedCtgfXlsx } from "@/lib/surrendered-ctgf-xlsx-parser"
import {
  FOREIGN_NATIONAL_ANALYTICS_CACHE_TAG,
  replaceForeignNationalWorkbook,
} from "@/lib/foreign-national-records"
import { parseForeignNationalXlsx } from "@/lib/foreign-national-xlsx-parser"
import { TRAININGS_ANALYTICS_CACHE_TAG, replaceTrainingsWorkbook } from "@/lib/trainings-records"
import { parseTrainingsXlsx } from "@/lib/trainings-xlsx-parser"

const MAX_BMI_UPLOAD_BYTES = 15 * 1024 * 1024
const MAX_CRIME_UPLOAD_BYTES = 25 * 1024 * 1024
const MAX_CRIME_RECORDS_CHUNK = 500
const MAX_FIREARMS_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_MOBILITY_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_UPER_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_ESTABLISHMENT_UPLOAD_BYTES = 15 * 1024 * 1024
const MAX_TRAININGS_UPLOAD_BYTES = 10 * 1024 * 1024

export async function getAccessTokensAction() {
  await requireSuperAdminSession()
  return listAccessTokens()
}

export async function createAccessTokenAction(
  label: string,
  role: AccessKeyRole,
  officerExpirationDays?: number,
  divisionScope?: string,
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
    divisionScope:
      role === "division_uploader" && divisionScope
        ? (divisionScope as DivisionId)
        : null,
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
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang upload. Subukan ulit o bawasan ang laki ng file.")
  }
}

export async function beginCrimeUploadAction(filename: string) {
  const session = await requireSuperAdminSession()
  const trimmed = filename.trim()

  if (!trimmed.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Excel (.xlsx) lang ang tinatanggap.")
  }

  return beginCrimeUploadBatch(trimmed, session.label)
}

export async function appendCrimeRecordsChunkAction(
  batchId: string,
  records: ParsedCrimeRecord[],
) {
  await requireSuperAdminSession()

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  if (records.length === 0) {
    return
  }

  if (records.length > MAX_CRIME_RECORDS_CHUNK) {
    throw new Error(`Too many records in one chunk (max ${MAX_CRIME_RECORDS_CHUNK}).`)
  }

  await appendCrimeRecordsChunk(batchId, records)
}

export async function abortCrimeUploadAction(batchId: string) {
  await requireSuperAdminSession()
  if (!batchId.trim()) return
  await abortCrimeUploadBatch(batchId)
}

export async function finalizeCrimeUploadAction(batchId: string) {
  await requireSuperAdminSession()

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  const result = await finalizeCrimeUploadBatch(batchId)

  updateTag(CRIME_ANALYTICS_CACHE_TAG)
  revalidatePath("/settings")
  revalidatePath("/ridmd")
  revalidatePath("/crime-statistics")

  return result
}

export async function uploadCrimeRecordsAction(formData: FormData) {
  try {
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

    if (file.size > MAX_CRIME_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 25 MB ang file. Hatiin o i-compress muna.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = parseCrimeXlsx(buffer)
    const result = await replaceCrimeRecords({
      filename: file.name,
      uploadedByLabel: session.label,
      records: parsed.records,
    })

    updateTag(CRIME_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/ridmd")
    revalidatePath("/crime-statistics")

    return {
      batch: result.batch,
      insertedCount: result.insertedCount,
      skippedRows: parsed.skippedRows,
      skippedInvalidCategoryRows: parsed.skippedInvalidCategoryRows,
      analytics: result.analytics,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang crime stats upload. Subukan ulit.")
  }
}

export async function uploadFirearmsWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rlrdd")
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

    if (file.size > MAX_FIREARMS_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseFirearmsXlsx(buffer)
    const result = await replaceFirearmsWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(FIREARMS_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rlrdd")
    revalidatePath("/rlrdd/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang firearms upload. Subukan ulit.")
  }
}

export async function uploadMobilityClearbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rlrdd")
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

    if (file.size > MAX_MOBILITY_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 10 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseMobilityWorkbookXlsx(buffer)
    const result = await replaceMobilityClearbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(MOBILITY_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rlrdd")
    revalidatePath("/rlrdd/upload")
    revalidatePath("/mobility")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang Clearbook upload. Subukan ulit.")
  }
}

export async function uploadUperWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rpsmd")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseUperXlsx(buffer)
    const result = await replaceUperWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(UPER_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rpsmd")
    revalidatePath("/rpsmd/upload")
    revalidatePath("/pro4a-status")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang UPER upload. Subukan ulit.")
  }
}

export async function uploadPpoUperWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rpsmd")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parsePpoUperXlsx(buffer)
    const result = await replacePpoUperWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(PPO_UPER_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rpsmd")
    revalidatePath("/rpsmd/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang PPO UPER upload. Subukan ulit.")
  }
}

export async function uploadStationClassificationWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rpsmd")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseStationClassificationXlsx(buffer)
    const result = await replaceStationClassificationWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(STATION_CLASSIFICATION_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rpsmd")
    revalidatePath("/rpsmd/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang station classification upload. Subukan ulit.")
  }
}

export async function uploadLegislativeAgendaWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rpsmd")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseLegislativeAgendaXlsx(buffer)
    const result = await replaceLegislativeAgendaWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(LEGISLATIVE_AGENDA_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rpsmd")
    revalidatePath("/rpsmd/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang legislative agenda upload. Subukan ulit.")
  }
}

export async function uploadTerrorismThreatWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rid")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseTerrorismThreatXlsx(buffer)
    const result = await replaceTerrorismThreatWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(TERRORISM_THREAT_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rid")
    revalidatePath("/rid/upload")
    revalidatePath("/pro4a-status")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang terrorism threat upload. Subukan ulit.")
  }
}

export async function uploadIllegalDrugsWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rid")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseIllegalDrugsXlsx(buffer)
    const result = await replaceIllegalDrugsWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(ILLEGAL_DRUGS_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rid")
    revalidatePath("/rid/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang illegal drugs upload. Subukan ulit.")
  }
}

export async function uploadCriminalGangsWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rid")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseCriminalGangsXlsx(buffer)
    const result = await replaceCriminalGangsWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(CRIMINAL_GANGS_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rid")
    revalidatePath("/rid/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang criminal gangs upload. Subukan ulit.")
  }
}

export async function uploadSurrenderedCtgfWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rid")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseSurrenderedCtgfXlsx(buffer)
    const result = await replaceSurrenderedCtgfWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(SURRENDERED_CTGF_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rid")
    revalidatePath("/rid/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang surrendered CTGs upload. Subukan ulit.")
  }
}

export async function uploadForeignNationalWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rid")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseForeignNationalXlsx(buffer)
    const result = await replaceForeignNationalWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(FOREIGN_NATIONAL_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rid")
    revalidatePath("/rid/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang foreign national upload. Subukan ulit.")
  }
}

export async function uploadRcaddAccomplishmentWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rcadd")
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

    if (file.size > MAX_UPER_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 5 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseRcaddAccomplishmentXlsx(buffer)
    const result = await replaceRcaddWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(RCADD_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rcadd")
    revalidatePath("/rcadd/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang RCADD accomplishment upload. Subukan ulit.")
  }
}

export async function uploadEstablishmentWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rod")
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

    if (file.size > MAX_ESTABLISHMENT_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 15 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseEstablishmentXlsx(buffer)
    const result = await replaceEstablishmentWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(ESTABLISHMENT_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/police-intervention")
    revalidatePath("/police-intervention/upload")

    return {
      batch: result.batch,
      insertedCount: result.insertedCount,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang establishment upload. Subukan ulit.")
  }
}

export async function uploadTrainingsWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("retd")
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

    if (file.size > MAX_TRAININGS_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 10 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseTrainingsXlsx(buffer)
    const result = await replaceTrainingsWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(TRAININGS_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/trainings-and-education")
    revalidatePath("/trainings-and-education/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang RTAP accomplishment upload. Subukan ulit.")
  }
}

export async function updateAlertLevelAction(level: AlertLevelId, remarks?: string | null) {
  try {
    const session = await requireAlertLevelManageSession()

    if (!isAlertLevelId(level)) {
      throw new Error("Invalid alert level.")
    }

    const result = await updateAlertLevelSetting(level, session.label, remarks)

    updateTag(ALERT_LEVEL_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/pro4a-status")

    return result
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang alert level update. Subukan ulit.")
  }
}
