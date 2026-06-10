import { unstable_cache } from "next/cache"

import {
  BMI_CATEGORIES,
  getBmiCategoryFromLabel,
  getBmiCategoryFromValue,
  type BmiCategoryId,
} from "@/lib/bmi-config"
import { fetchHealthSheetCsv, parseCsv } from "@/lib/google-sheets"
import type { BmiCategoryCount, HealthAnalytics } from "@/lib/health-types"

const HEALTH_HEADER_PATTERNS = [/bmi/i]

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

function looksLikeHealthSheet(rows: Record<string, string>[]) {
  if (rows.length === 0) return false

  const headers = Object.keys(rows[0])
  return headers.some((header) => HEALTH_HEADER_PATTERNS.some((pattern) => pattern.test(header)))
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
    totalAssessed: 0,
    categories: BMI_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      count: 0,
      percentage: 0,
    })),
  }
}

async function loadHealthAnalytics(): Promise<HealthAnalytics> {
  try {
    const csv = await fetchHealthSheetCsv()
    const rows = parseCsv(csv)

    if (!looksLikeHealthSheet(rows)) {
      return emptyAnalytics()
    }

    const categories = buildCategoryCounts(rows)
    const totalAssessed = categories.reduce((sum, category) => sum + category.count, 0)

    if (totalAssessed === 0) {
      return emptyAnalytics()
    }

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      totalAssessed,
      categories,
    }
  } catch {
    return emptyAnalytics()
  }
}

const getCachedHealthAnalytics = unstable_cache(
  loadHealthAnalytics,
  ["health-analytics-rictmd"],
  { revalidate: 600 },
)

export async function getHealthAnalytics(): Promise<HealthAnalytics> {
  return getCachedHealthAnalytics()
}
