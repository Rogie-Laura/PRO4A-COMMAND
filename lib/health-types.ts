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

export type HealthAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  totalAssessed: number
  categories: BmiCategoryCount[]
  personnelByCategory: Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>>
}
