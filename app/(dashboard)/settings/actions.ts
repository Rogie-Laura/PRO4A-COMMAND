"use server"

import { revalidatePath, updateTag } from "next/cache"

import {
  createAccessToken,
  getAccessTokenLoginUrl,
  listAccessTokens,
  revokeAccessToken,
} from "@/lib/access-tokens"
import { requireSuperAdminSession, requireDivisionUploadSession, requireAlertLevelManageSession, requireCrimeUploadSession } from "@/lib/auth/get-session"
import type { AccessKeyRole } from "@/lib/auth/roles"
import type { DivisionId } from "@/lib/division-scope"
import {
  abortBmiUploadBatch,
  appendBmiRecordsChunk,
  beginBmiUploadBatch,
  finalizeBmiUploadBatch,
  getLatestBmiUploadBatch,
  replaceBmiRecords,
} from "@/lib/bmi-records"
import { parseBmiXlsx, type ParsedBmiRecord } from "@/lib/bmi-xlsx-parser"
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
  RANDOM_DRUG_TEST_ANALYTICS_CACHE_TAG,
  replaceRandomDrugTestWorkbook,
} from "@/lib/random-drug-test-records"
import { parseRandomDrugTestXlsx } from "@/lib/random-drug-test-xlsx-parser"
import {
  DRUG_CLEARING_ANALYTICS_CACHE_TAG,
  replaceDrugClearingWorkbook,
} from "@/lib/drug-clearing-records"
import { parseDrugClearingXlsx } from "@/lib/drug-clearing-xlsx-parser"
import {
  COMMUNITY_MOBILIZATION_ANALYTICS_CACHE_TAG,
  replaceCommunityMobilizationWorkbook,
} from "@/lib/community-mobilization-records"
import { parseCommunityMobilizationXlsx } from "@/lib/community-mobilization-xlsx-parser"
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
  INTEL_ELIGIBILITY_ANALYTICS_CACHE_TAG,
  replaceIntelEligibilityWorkbook,
} from "@/lib/intel-eligibility-records"
import { parseIntelEligibilityXlsx } from "@/lib/intel-eligibility-xlsx-parser"
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
import {
  ADMIN_HOLDING_ANALYTICS_CACHE_TAG,
  replaceAdminHoldingWorkbook,
} from "@/lib/admin-holding-records"
import { parseAdminHoldingXlsx } from "@/lib/admin-holding-xlsx-parser"
import {
  abortRprmdWorkbookUploadBatch,
  appendRprmdPersonnelChunk,
  appendRprmdWorkbookMeta,
  beginRprmdWorkbookUploadBatch,
  finalizeRprmdWorkbookUploadBatch,
  replaceRprmdWorkbook,
  RPRMD_WORKBOOK_CACHE_TAG,
  type RprmdWorkbookMetaChunk,
} from "@/lib/rprmd-workbook-records"
import { parseRprmdWorkbookXlsx } from "@/lib/rprmd-workbook-xlsx-parser"
import type { PersonnelRecord } from "@/lib/personnel-types"
import { PERSONNEL_ANALYTICS_CACHE_TAG } from "@/lib/personnel-analytics"
import {
  SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG,
  SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG,
} from "@/lib/schooling-analytics"
import { DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG } from "@/lib/detailed-personnel-analytics"
import {
  ICT_EQUIPMENT_ANALYTICS_CACHE_TAG,
  replaceIctEquipmentWorkbook,
} from "@/lib/ict-equipment-records"
import { parseIctEquipmentXlsx } from "@/lib/ict-equipment-xlsx-parser"

const MAX_BMI_UPLOAD_BYTES = 15 * 1024 * 1024
const MAX_BMI_RECORDS_CHUNK = 800
const MAX_CRIME_UPLOAD_BYTES = 25 * 1024 * 1024
const MAX_CRIME_RECORDS_CHUNK = 500
const MAX_FIREARMS_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_MOBILITY_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_UPER_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_ESTABLISHMENT_UPLOAD_BYTES = 15 * 1024 * 1024
const MAX_TRAININGS_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_ADMIN_HOLDING_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_RPRMD_WORKBOOK_UPLOAD_BYTES = 25 * 1024 * 1024
const MAX_RPRMD_PERSONNEL_CHUNK = 500
const MAX_ICT_EQUIPMENT_UPLOAD_BYTES = 15 * 1024 * 1024

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

export async function beginBmiUploadAction(filename: string) {
  const session = await requireSuperAdminSession()
  const trimmed = filename.trim()

  if (!trimmed.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Excel (.xlsx) lang ang tinatanggap.")
  }

  return beginBmiUploadBatch(trimmed, session.label)
}

export async function appendBmiRecordsChunkAction(batchId: string, records: ParsedBmiRecord[]) {
  await requireSuperAdminSession()

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  if (records.length === 0) {
    return
  }

  if (records.length > MAX_BMI_RECORDS_CHUNK) {
    throw new Error(`Too many records in one chunk (max ${MAX_BMI_RECORDS_CHUNK}).`)
  }

  await appendBmiRecordsChunk(batchId, records)
}

export async function abortBmiUploadAction(batchId: string) {
  await requireSuperAdminSession()
  if (!batchId.trim()) return
  await abortBmiUploadBatch(batchId)
}

export async function finalizeBmiUploadAction(batchId: string) {
  await requireSuperAdminSession()

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  const result = await finalizeBmiUploadBatch(batchId)

  updateTag(HEALTH_ANALYTICS_CACHE_TAG)
  revalidatePath("/settings")
  revalidatePath("/health-and-bmi")

  return {
    batch: result.batch,
    insertedCount: result.insertedCount,
  }
}

export async function beginCrimeUploadAction(filename: string) {
  const session = await requireCrimeUploadSession()
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
  await requireCrimeUploadSession()

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
  await requireCrimeUploadSession()
  if (!batchId.trim()) return
  await abortCrimeUploadBatch(batchId)
}

export async function finalizeCrimeUploadAction(batchId: string) {
  await requireCrimeUploadSession()

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  const result = await finalizeCrimeUploadBatch(batchId)

  updateTag(CRIME_ANALYTICS_CACHE_TAG)
  revalidatePath("/settings")
  revalidatePath("/ridmd")
  revalidatePath("/ridmd/upload")
  revalidatePath("/crime-statistics")
  revalidatePath("/comparative-crime-stats")

  return result
}

export async function uploadCrimeRecordsAction(formData: FormData) {
  try {
    const session = await requireCrimeUploadSession()
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
    revalidatePath("/ridmd/upload")
    revalidatePath("/crime-statistics")
    revalidatePath("/comparative-crime-stats")

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

export async function uploadRandomDrugTestWorkbookAction(formData: FormData) {
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
    const workbook = parseRandomDrugTestXlsx(buffer)
    const result = await replaceRandomDrugTestWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(RANDOM_DRUG_TEST_ANALYTICS_CACHE_TAG)
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

    throw new Error("Hindi natapos ang Random Drug Test upload. Subukan ulit.")
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

export async function uploadIntelEligibilityWorkbookAction(formData: FormData) {
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
    const workbook = parseIntelEligibilityXlsx(buffer)
    const result = await replaceIntelEligibilityWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(INTEL_ELIGIBILITY_ANALYTICS_CACHE_TAG)
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

    throw new Error("Hindi natapos ang Intelligence Eligibility upload. Subukan ulit.")
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

export async function uploadDrugClearingWorkbookAction(formData: FormData) {
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
    const workbook = parseDrugClearingXlsx(buffer)
    const result = await replaceDrugClearingWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(DRUG_CLEARING_ANALYTICS_CACHE_TAG)
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

    throw new Error("Hindi natapos ang drug clearing upload. Subukan ulit.")
  }
}

export async function uploadCommunityMobilizationWorkbookAction(formData: FormData) {
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
    const workbook = parseCommunityMobilizationXlsx(buffer)
    const result = await replaceCommunityMobilizationWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(COMMUNITY_MOBILIZATION_ANALYTICS_CACHE_TAG)
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

    throw new Error("Hindi natapos ang Community Mobilization upload. Subukan ulit.")
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

export async function uploadAdminHoldingWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rprmd")
    const file = formData.get("file")

    if (!(file instanceof File)) {
      throw new Error("Pumili ng Excel file (.xlsx o .xlsm).")
    }

    const lowerName = file.name.toLowerCase()
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xlsm")) {
      throw new Error("Excel (.xlsx o .xlsm) lang ang tinatanggap.")
    }

    if (file.size === 0) {
      throw new Error("Walang laman ang file.")
    }

    if (file.size > MAX_ADMIN_HOLDING_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 10 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseAdminHoldingXlsx(buffer)
    const result = await replaceAdminHoldingWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(ADMIN_HOLDING_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/rprmd")
    revalidatePath("/rprmd/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang admin holding upload. Subukan ulit.")
  }
}

export async function beginRprmdWorkbookUploadAction(filename: string) {
  const session = await requireDivisionUploadSession("rprmd")
  const trimmed = filename.trim()

  if (!trimmed.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Excel (.xlsx) lang ang tinatanggap.")
  }

  return beginRprmdWorkbookUploadBatch(trimmed, session.label)
}

export async function appendRprmdPersonnelChunkAction(
  batchId: string,
  records: PersonnelRecord[],
) {
  await requireDivisionUploadSession("rprmd")

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  if (records.length === 0) {
    return
  }

  if (records.length > MAX_RPRMD_PERSONNEL_CHUNK) {
    throw new Error(`Too many personnel records in one chunk (max ${MAX_RPRMD_PERSONNEL_CHUNK}).`)
  }

  await appendRprmdPersonnelChunk(batchId, records)
}

export async function appendRprmdWorkbookMetaAction(
  batchId: string,
  meta: RprmdWorkbookMetaChunk,
) {
  await requireDivisionUploadSession("rprmd")

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  await appendRprmdWorkbookMeta(batchId, meta)
}

export async function abortRprmdWorkbookUploadAction(batchId: string) {
  await requireDivisionUploadSession("rprmd")
  if (!batchId.trim()) return
  await abortRprmdWorkbookUploadBatch(batchId)
}

function revalidateRprmdWorkbookPaths() {
  updateTag(RPRMD_WORKBOOK_CACHE_TAG)
  updateTag(PERSONNEL_ANALYTICS_CACHE_TAG)
  updateTag(SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG)
  updateTag(SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG)
  updateTag(DETAILED_PERSONNEL_DASHBOARD_CACHE_TAG)
  revalidatePath("/settings")
  revalidatePath("/rprmd")
  revalidatePath("/rprmd/upload")
  revalidatePath("/pro4a-status")
}

export async function finalizeRprmdWorkbookUploadAction(batchId: string) {
  await requireDivisionUploadSession("rprmd")

  if (!batchId.trim()) {
    throw new Error("Missing upload batch.")
  }

  const result = await finalizeRprmdWorkbookUploadBatch(batchId)
  revalidateRprmdWorkbookPaths()

  return {
    batch: result.batch,
    summary: {
      personnelCount: result.payload.personnelRecords.length,
      mandatoryCount: result.payload.mandatorySchooling.total,
      specializedCount: result.payload.specializedSchooling.total,
      detailedNhq: result.payload.detailed.nhq.total,
      detailedNosus: result.payload.detailed.nosus.total,
      detailedRsu: result.payload.detailed.rsu.total,
      detailedRhqPpo: result.payload.detailed.rhqPpo.total,
      alphalistSheetName: result.alphalistSheetName,
      gainsLossesReady: Boolean(result.payload.personnelGainsLosses?.dataReady),
      gainsTotal:
        result.payload.personnelGainsLosses?.gains.reduce((sum, line) => sum + line.counts.total, 0) ??
        0,
      lossesTotal:
        result.payload.personnelGainsLosses?.losses.reduce((sum, line) => sum + line.counts.total, 0) ??
        0,
    },
  }
}

export async function uploadRprmdWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rprmd")
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

    if (file.size > MAX_RPRMD_WORKBOOK_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 25 MB ang file. Hatiin o i-compress muna.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseRprmdWorkbookXlsx(buffer)
    const result = await replaceRprmdWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    revalidateRprmdWorkbookPaths()

    return {
      batch: result.batch,
      summary: {
        personnelCount: result.payload.personnelRecords.length,
        mandatoryCount: result.payload.mandatorySchooling.total,
        specializedCount: result.payload.specializedSchooling.total,
        detailedNhq: result.payload.detailed.nhq.total,
        detailedNosus: result.payload.detailed.nosus.total,
        detailedRsu: result.payload.detailed.rsu.total,
        detailedRhqPpo: result.payload.detailed.rhqPpo.total,
        alphalistSheetName: workbook.alphalistSheetName,
        gainsLossesReady: Boolean(result.payload.personnelGainsLosses?.dataReady),
        gainsTotal:
          result.payload.personnelGainsLosses?.gains.reduce((sum, line) => sum + line.counts.total, 0) ??
          0,
        lossesTotal:
          result.payload.personnelGainsLosses?.losses.reduce(
            (sum, line) => sum + line.counts.total,
            0,
          ) ?? 0,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang RPRMD workbook upload. Subukan ulit.")
  }
}

export async function uploadIctEquipmentWorkbookAction(formData: FormData) {
  try {
    const session = await requireDivisionUploadSession("rictmd")
    const file = formData.get("file")

    if (!(file instanceof File)) {
      throw new Error("Pumili ng Excel file (.xlsx o .xlsm).")
    }

    const lowerName = file.name.toLowerCase()
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xlsm")) {
      throw new Error("Excel (.xlsx o .xlsm) lang ang tinatanggap.")
    }

    if (file.size === 0) {
      throw new Error("Walang laman ang file.")
    }

    if (file.size > MAX_ICT_EQUIPMENT_UPLOAD_BYTES) {
      throw new Error("Mas malaki sa 15 MB ang file.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = parseIctEquipmentXlsx(buffer)
    const result = await replaceIctEquipmentWorkbook({
      filename: file.name,
      uploadedByLabel: session.label,
      workbook,
    })

    updateTag(ICT_EQUIPMENT_ANALYTICS_CACHE_TAG)
    revalidatePath("/settings")
    revalidatePath("/ict-equipment-inventory")
    revalidatePath("/ict-equipment-inventory/upload")

    return {
      batch: result.batch,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Hindi natapos ang ICT inventory upload. Subukan ulit.")
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
