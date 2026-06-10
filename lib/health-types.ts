export type BmiCategoryCount = {
  id: string
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
