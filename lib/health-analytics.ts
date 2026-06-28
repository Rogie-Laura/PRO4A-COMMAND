import { unstable_cache } from "next/cache"

import { BMI_SUPABASE_SOURCE_LABEL } from "@/lib/bmi-analytics-build"
import {
  BMI_CATEGORIES,
  getBmiCategoryFromLabel,
  getBmiCategoryFromValue,
  isBmiDrilldownCategory,
  type BmiCategoryId,
} from "@/lib/bmi-config"
import { fetchBmiPersonnelByCategory, fetchStoredBmiAnalytics } from "@/lib/bmi-records"
import { fetchRictmdBmiSheetCsv, parseCsv } from "@/lib/google-sheets"
import {
  isRictmdBmiSheet,
  isRictmdPersonnelRow,
  RICTMD_BMI_SHEET,
} from "@/lib/rictmd-bmi-sheet"
import type { BmiCategoryCount, BmiPersonnelDetail, HealthAnalyticsSummary } from "@/lib/health-types"

export { BMI_SUPABASE_SOURCE_LABEL }

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

  return BMI_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    count: counts[category.id],
    percentage: assessed > 0 ? Math.round((counts[category.id] / assessed) * 1000) / 10 : 0,
  }))
}

function emptyAnalytics(): HealthAnalyticsSummary {
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
  }
}

async function loadFromSupabase(): Promise<HealthAnalyticsSummary | null> {
  try {
    const stored = await fetchStoredBmiAnalytics()
    if (!stored || !stored.dataReady) return null
    return stored
  } catch {
    return null
  }
}

async function loadFromGoogleSheet(): Promise<HealthAnalyticsSummary | null> {
  try {
    const csv = await fetchRictmdBmiSheetCsv()
    const rows = parseCsv(csv)

    if (!isRictmdBmiSheet(rows)) {
      return null
    }

    const rictmdRows = rows.filter(isRictmdPersonnelRow)
    const categories = buildCategoryCountsFromSheet(rictmdRows)
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
    }
  } catch {
    return null
  }
}

async function loadSheetPersonnelForCategory(categoryId: BmiCategoryId): Promise<BmiPersonnelDetail[]> {
  if (!isBmiDrilldownCategory(categoryId)) return []

  try {
    const csv = await fetchRictmdBmiSheetCsv()
    const rows = parseCsv(csv)

    if (!isRictmdBmiSheet(rows)) {
      return []
    }

    const personnel = rows
      .filter(isRictmdPersonnelRow)
      .filter((row) => hasBmiData(row) && resolveBmiCategory(row) === categoryId)
      .map(mapPersonnelDetail)
      .sort((left, right) => {
        const byName = left.name.localeCompare(right.name, "en", { sensitivity: "base" })
        if (byName !== 0) return byName
        return left.rank.localeCompare(right.rank, "en", { sensitivity: "base" })
      })

    return personnel
  } catch {
    return []
  }
}

export async function fetchBmiPersonnelForCategory(
  categoryId: BmiCategoryId,
): Promise<BmiPersonnelDetail[]> {
  try {
    const fromSupabase = await fetchBmiPersonnelByCategory(categoryId)
    if (fromSupabase.length > 0) {
      return fromSupabase
    }
  } catch {
    // fall through to Google Sheet fallback
  }

  return loadSheetPersonnelForCategory(categoryId)
}

async function loadHealthAnalytics(): Promise<HealthAnalyticsSummary> {
  const fromSupabase = await loadFromSupabase()
  if (fromSupabase) return fromSupabase

  const fromSheet = await loadFromGoogleSheet()
  if (fromSheet) return fromSheet

  return emptyAnalytics()
}

export const HEALTH_ANALYTICS_CACHE_TAG = "health-analytics-supabase-v2"

/** Cached until manual refresh — summary only; personnel loads on drilldown. */
const getCachedHealthAnalytics = unstable_cache(
  loadHealthAnalytics,
  [HEALTH_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [HEALTH_ANALYTICS_CACHE_TAG] },
)

export async function getHealthAnalytics(): Promise<HealthAnalyticsSummary> {
  return getCachedHealthAnalytics()
}
