import type { BmiCategoryId } from "@/lib/bmi-config"

export type BmiCategoryCount = {
  id: BmiCategoryId
  label: string
  count: number
  percentage: number
}

export type HealthAnalytics = {
  lastUpdated: string
  dataReady: boolean
  totalAssessed: number
  categories: BmiCategoryCount[]
}
