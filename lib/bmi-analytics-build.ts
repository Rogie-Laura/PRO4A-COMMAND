import {
  BMI_CATEGORIES,
  getBmiCategoryFromLabel,
  getBmiCategoryFromValue,
  type BmiCategoryId,
} from "@/lib/bmi-config"
import type { BmiCategoryCount, HealthAnalyticsSummary } from "@/lib/health-types"
import type { ParsedBmiRecord } from "@/lib/bmi-xlsx-parser"

export const BMI_SUPABASE_SOURCE_LABEL = "PRO4A BMI Records (Supabase)"

type BmiRecordLike = {
  bmiCategoryId: BmiCategoryId | null
  bmiClass: string
  bmiResult: number | null
}

function resolveCategory(record: BmiRecordLike): BmiCategoryId | null {
  return (
    record.bmiCategoryId ??
    getBmiCategoryFromLabel(record.bmiClass) ??
    (record.bmiResult != null ? getBmiCategoryFromValue(record.bmiResult) : null)
  )
}

function toCategoryCounts(counts: Record<BmiCategoryId, number>, assessed: number): BmiCategoryCount[] {
  return BMI_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    count: counts[category.id],
    percentage: assessed > 0 ? Math.round((counts[category.id] / assessed) * 1000) / 10 : 0,
  }))
}

function buildCategoryCounts(records: BmiRecordLike[]): BmiCategoryCount[] {
  const counts = Object.fromEntries(BMI_CATEGORIES.map((category) => [category.id, 0])) as Record<
    BmiCategoryId,
    number
  >

  let assessed = 0

  for (const record of records) {
    const categoryId = resolveCategory(record)
    if (!categoryId) continue

    counts[categoryId] += 1
    assessed += 1
  }

  return toCategoryCounts(counts, assessed)
}

export function buildHealthAnalyticsSummaryFromParsedRecords(
  records: ParsedBmiRecord[],
  meta: { fileName: string; lastUpdated: string },
): HealthAnalyticsSummary {
  const categories = buildCategoryCounts(records)
  const totalAssessed = categories.reduce((sum, category) => sum + category.count, 0)

  return {
    lastUpdated: meta.lastUpdated,
    dataReady: totalAssessed > 0,
    dataSource: BMI_SUPABASE_SOURCE_LABEL,
    totalAssessed,
    categories,
  }
}

export function buildHealthAnalyticsSummaryFromCategoryCounts(
  categoryCounts: Record<BmiCategoryId, number>,
  meta: { fileName: string; lastUpdated: string },
): HealthAnalyticsSummary {
  const assessed = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
  const categories = toCategoryCounts(categoryCounts, assessed)

  return {
    lastUpdated: meta.lastUpdated,
    dataReady: assessed > 0,
    dataSource: BMI_SUPABASE_SOURCE_LABEL,
    totalAssessed: assessed,
    categories,
  }
}
