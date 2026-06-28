import { unstable_cache } from "next/cache"

import {
  BMI_CATEGORIES,
  getBmiCategoryFromLabel,
  getBmiCategoryFromValue,
  isBmiDrilldownCategory,
  type BmiCategoryId,
} from "@/lib/bmi-config"
import { fetchStoredBmiRecords, type StoredBmiRecord } from "@/lib/bmi-records"
import { fetchRictmdBmiSheetCsv, parseCsv } from "@/lib/google-sheets"
import {
  isRictmdBmiSheet,
  isRictmdPersonnelRow,
  RICTMD_BMI_SHEET,
} from "@/lib/rictmd-bmi-sheet"
import type { BmiCategoryCount, BmiPersonnelDetail, HealthAnalytics } from "@/lib/health-types"

export const BMI_SUPABASE_SOURCE_LABEL = "PRO4A BMI Records (Supabase)"

function pickField(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]?.trim()
    if (value) return value
  }
  return ""
}

function parseNumber(value: string) {
  const trimmed = value.replace(/,/g, "").trim()
  if (!trimmed || trimmed.startsWith("#")) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveBmiCategory(row: Record<string, string>): BmiCategoryId | null {
  const categoryLabel = pickField(row, [
    "BMI Category",
    "Category",
    "BMI Classification",
    "Classification",
    "Nutritional Status",
    "BMI Class",
  ])

  const fromLabel = getBmiCategoryFromLabel(categoryLabel)
  if (fromLabel) return fromLabel

  const bmiValue = parseNumber(pickField(row, ["BMI", "BMI Value", "Body Mass Index", "BMI Score", "BMI Result"]))
  if (bmiValue !== null) return getBmiCategoryFromValue(bmiValue)

  return null
}

function hasBmiData(row: Record<string, string>) {
  return Boolean(
    pickField(row, ["BMI Category", "BMI", "BMI Class", "BMI Result"]),
  )
}

function formatPersonName(row: Record<string, string>) {
  const firstName = pickField(row, ["First Name"])
  const middleName = pickField(row, ["Middle Name"])
  const surname = pickField(row, ["Surname"])
  const middle = middleName ? ` ${middleName.charAt(0)}.` : ""

  if (surname && firstName) return `${surname}, ${firstName}${middle}`
  return firstName || surname || "Unknown"
}

function formatStoredPersonName(record: StoredBmiRecord) {
  const parts = record.fullName.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    const surname = parts[parts.length - 1]
    const firstName = parts[0]
    const middle =
      parts.length > 2 && parts[1] ? ` ${parts[1].charAt(0)}.` : ""
    return `${surname}, ${firstName}${middle}`
  }

  return record.fullName || record.rank || "Unknown"
}

function mapPersonnelDetail(row: Record<string, string>): BmiPersonnelDetail {
  const rank = pickField(row, ["Rank"])
  const name = formatPersonName(row)
  const unit = pickField(row, ["Station/Office", "Unit", "Office", "SubUnitDesc", "Assignment"])
  const age = pickField(row, ["Age"])

  return {
    id: `${rank}-${name}`.toLowerCase().replace(/\s+/g, "-"),
    rank,
    name,
    unit: unit || "—",
    age: age || "—",
  }
}

function mapStoredPersonnelDetail(record: StoredBmiRecord): BmiPersonnelDetail {
  const name = formatStoredPersonName(record)
  const unit = record.subUnit || record.assignment

  return {
    id: String(record.id),
    rank: record.rank,
    name,
    unit: unit || "—",
    age: record.age != null ? String(record.age) : "—",
  }
}

function buildPersonnelByCategoryFromSheet(
  rows: Record<string, string>[],
): Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>> {
  const grouped = Object.fromEntries(
    BMI_CATEGORIES.map((category) => [category.id, [] as BmiPersonnelDetail[]]),
  ) as Record<BmiCategoryId, BmiPersonnelDetail[]>

  for (const row of rows) {
    if (!hasBmiData(row)) continue

    const categoryId = resolveBmiCategory(row)
    if (!categoryId || !isBmiDrilldownCategory(categoryId)) continue

    grouped[categoryId].push(mapPersonnelDetail(row))
  }

  return finalizePersonnelGroups(grouped)
}

function buildPersonnelByCategoryFromRecords(
  records: StoredBmiRecord[],
): Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>> {
  const grouped = Object.fromEntries(
    BMI_CATEGORIES.map((category) => [category.id, [] as BmiPersonnelDetail[]]),
  ) as Record<BmiCategoryId, BmiPersonnelDetail[]>

  for (const record of records) {
    const categoryId =
      record.bmiCategoryId ??
      getBmiCategoryFromLabel(record.bmiClass) ??
      (record.bmiResult != null ? getBmiCategoryFromValue(record.bmiResult) : null)

    if (!categoryId || !isBmiDrilldownCategory(categoryId)) continue

    grouped[categoryId].push(mapStoredPersonnelDetail(record))
  }

  return finalizePersonnelGroups(grouped)
}

function finalizePersonnelGroups(
  grouped: Record<BmiCategoryId, BmiPersonnelDetail[]>,
): Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>> {
  for (const categoryId of Object.keys(grouped) as BmiCategoryId[]) {
    grouped[categoryId].sort((left, right) => {
      const byName = left.name.localeCompare(right.name, "en", { sensitivity: "base" })
      if (byName !== 0) return byName
      return left.rank.localeCompare(right.rank, "en", { sensitivity: "base" })
    })
  }

  const personnelByCategory: Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>> = {}

  for (const categoryId of Object.keys(grouped) as BmiCategoryId[]) {
    if (grouped[categoryId].length > 0) {
      personnelByCategory[categoryId] = grouped[categoryId]
    }
  }

  return personnelByCategory
}

function buildCategoryCountsFromSheet(rows: Record<string, string>[]): BmiCategoryCount[] {
  const counts = Object.fromEntries(BMI_CATEGORIES.map((category) => [category.id, 0])) as Record<
    BmiCategoryId,
    number
  >

  let assessed = 0

  for (const row of rows) {
    if (!hasBmiData(row)) continue

    const categoryId = resolveBmiCategory(row)
    if (!categoryId) continue

    counts[categoryId] += 1
    assessed += 1
  }

  return toCategoryCounts(counts, assessed)
}

function buildCategoryCountsFromRecords(records: StoredBmiRecord[]): BmiCategoryCount[] {
  const counts = Object.fromEntries(BMI_CATEGORIES.map((category) => [category.id, 0])) as Record<
    BmiCategoryId,
    number
  >

  let assessed = 0

  for (const record of records) {
    const categoryId =
      record.bmiCategoryId ??
      getBmiCategoryFromLabel(record.bmiClass) ??
      (record.bmiResult != null ? getBmiCategoryFromValue(record.bmiResult) : null)

    if (!categoryId) continue

    counts[categoryId] += 1
    assessed += 1
  }

  return toCategoryCounts(counts, assessed)
}

function toCategoryCounts(counts: Record<BmiCategoryId, number>, assessed: number): BmiCategoryCount[] {
  return BMI_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    count: counts[category.id],
    percentage: assessed > 0 ? Math.round((counts[category.id] / assessed) * 1000) / 10 : 0,
  }))
}

function emptyAnalytics(): HealthAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: RICTMD_BMI_SHEET.label,
    totalAssessed: 0,
    categories: BMI_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      count: 0,
      percentage: 0,
    })),
    personnelByCategory: {},
  }
}

async function loadFromSupabase(): Promise<HealthAnalytics | null> {
  try {
    const stored = await fetchStoredBmiRecords()
    if (!stored) return null

    const categories = buildCategoryCountsFromRecords(stored.records)
    const personnelByCategory = buildPersonnelByCategoryFromRecords(stored.records)
    const totalAssessed = categories.reduce((sum, category) => sum + category.count, 0)

    if (totalAssessed === 0) return null

    return {
      lastUpdated: stored.batch.createdAt,
      dataReady: true,
      dataSource: BMI_SUPABASE_SOURCE_LABEL,
      totalAssessed,
      categories,
      personnelByCategory,
    }
  } catch {
    return null
  }
}

async function loadFromGoogleSheet(): Promise<HealthAnalytics | null> {
  try {
    const csv = await fetchRictmdBmiSheetCsv()
    const rows = parseCsv(csv)

    if (!isRictmdBmiSheet(rows)) {
      return null
    }

    const rictmdRows = rows.filter(isRictmdPersonnelRow)
    const categories = buildCategoryCountsFromSheet(rictmdRows)
    const personnelByCategory = buildPersonnelByCategoryFromSheet(rictmdRows)
    const totalAssessed = categories.reduce((sum, category) => sum + category.count, 0)

    if (totalAssessed === 0) {
      return null
    }

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: RICTMD_BMI_SHEET.label,
      totalAssessed,
      categories,
      personnelByCategory,
    }
  } catch {
    return null
  }
}

async function loadHealthAnalytics(): Promise<HealthAnalytics> {
  const fromSupabase = await loadFromSupabase()
  if (fromSupabase) return fromSupabase

  const fromSheet = await loadFromGoogleSheet()
  if (fromSheet) return fromSheet

  return emptyAnalytics()
}

export const HEALTH_ANALYTICS_CACHE_TAG = "health-analytics-supabase-v1"

/** Cached until manual refresh — no repeat fetch on revisit. */
const getCachedHealthAnalytics = unstable_cache(
  loadHealthAnalytics,
  [HEALTH_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [HEALTH_ANALYTICS_CACHE_TAG] },
)

export async function getHealthAnalytics(): Promise<HealthAnalytics> {
  return getCachedHealthAnalytics()
}
