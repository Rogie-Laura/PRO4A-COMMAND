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

/** @deprecated Loaded lazily on category drilldown — not included in page load. */
export type HealthAnalytics = HealthAnalyticsSummary & {
  personnelByCategory?: Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>>
}
