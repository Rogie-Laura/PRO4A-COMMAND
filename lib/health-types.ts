import type { BmiCategoryId } from "@/lib/bmi-config"

export type BmiCategoryCount = {
  id: BmiCategoryId
  label: string
  count: number
  percentage: number
}

export type BmiPersonnelDetail = {
  id: string
  rank: string
  name: string
  unit: string
  age: string
}

export type HealthAnalyticsSummary = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  totalAssessed: number
  categories: BmiCategoryCount[]
}

/**
 * Month-over-month movement between the two most recent BMI snapshots,
 * matched per person. `available` is false until at least two months exist.
 */
export type BmiTrackingSummary = {
  available: boolean
  currentMonthKey: string | null
  currentMonthLabel: string
  previousMonthKey: string | null
  previousMonthLabel: string
  currentTotal: number
  previousTotal: number
  matchedCount: number
  onlyCurrentCount: number
  onlyPreviousCount: number
  weight: {
    gained: number
    lost: number
    maintained: number
    withWeightData: number
    avgDeltaKg: number | null
    netDeltaKg: number
  }
  category: {
    improved: number
    worsened: number
    unchanged: number
    withCategoryData: number
  }
}

/** @deprecated Loaded lazily on category drilldown — not included in page load. */
export type HealthAnalytics = HealthAnalyticsSummary & {
  personnelByCategory?: Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>>
}
