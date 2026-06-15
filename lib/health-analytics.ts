import { unstable_cache } from "next/cache"

import {
  BMI_CATEGORIES,
  getBmiCategoryFromLabel,
  getBmiCategoryFromValue,
  isBmiDrilldownCategory,
  type BmiCategoryId,
} from "@/lib/bmi-config"
import { fetchRictmdBmiSheetCsv, parseCsv } from "@/lib/google-sheets"
import {
  isRictmdBmiSheet,
  isRictmdPersonnelRow,
  RICTMD_BMI_SHEET,
} from "@/lib/rictmd-bmi-sheet"
import type { BmiCategoryCount, BmiPersonnelDetail, HealthAnalytics } from "@/lib/health-types"

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
  ])

  const fromLabel = getBmiCategoryFromLabel(categoryLabel)
  if (fromLabel) return fromLabel

  const bmiValue = parseNumber(pickField(row, ["BMI", "BMI Value", "Body Mass Index", "BMI Score"]))
  if (bmiValue !== null) return getBmiCategoryFromValue(bmiValue)

  return null
}

function hasBmiData(row: Record<string, string>) {
  return Boolean(pickField(row, ["BMI Category", "BMI"]))
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
  const unit = pickField(row, ["Station/Office", "Unit", "Office"])
  const age = pickField(row, ["Age"])

  return {
    id: `${rank}-${name}`.toLowerCase().replace(/\s+/g, "-"),
    rank,
    name,
    unit: unit || "—",
    age: age || "—",
  }
}

function buildPersonnelByCategory(
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

  for (const categoryId of Object.keys(grouped) as BmiCategoryId[]) {
    grouped[categoryId].sort((a, b) => {
      const byName = a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      if (byName !== 0) return byName
      return a.rank.localeCompare(b.rank, "en", { sensitivity: "base" })
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

function buildCategoryCounts(rows: Record<string, string>[]): BmiCategoryCount[] {
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

async function loadHealthAnalytics(): Promise<HealthAnalytics> {
  try {
    const csv = await fetchRictmdBmiSheetCsv()
    const rows = parseCsv(csv)

    if (!isRictmdBmiSheet(rows)) {
      return emptyAnalytics()
    }

    const rictmdRows = rows.filter(isRictmdPersonnelRow)
    const categories = buildCategoryCounts(rictmdRows)
    const personnelByCategory = buildPersonnelByCategory(rictmdRows)
    const totalAssessed = categories.reduce((sum, category) => sum + category.count, 0)

    if (totalAssessed === 0) {
      return emptyAnalytics()
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
    return emptyAnalytics()
  }
}

export const HEALTH_ANALYTICS_CACHE_TAG = "health-analytics-rictmd-personnel-v2"

/** Cached until manual refresh — no repeat Google Sheet fetch on revisit. */
const getCachedHealthAnalytics = unstable_cache(
  loadHealthAnalytics,
  [HEALTH_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [HEALTH_ANALYTICS_CACHE_TAG] },
)

export async function getHealthAnalytics(): Promise<HealthAnalytics> {
  return getCachedHealthAnalytics()
}
