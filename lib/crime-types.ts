import type { CountItem } from "@/lib/personnel-types"

export type CrimeMonthlyCount = {
  monthKey: string
  label: string
  count: number
}

export type CrimeCategoryStats = {
  totalVolume: number
  coveredPeriodStart: string | null
  coveredPeriodEnd: string | null
  ppoBreakdown: CountItem[]
  unitBreakdownByPpo: Record<string, CountItem[]>
  crimeBreakdown: CountItem[]
  monthlyBreakdown: CrimeMonthlyCount[]
}

export type CrimeAnalytics = {
  lastUpdated: string
  fileName: string
  dataSource: string
  dataReady: boolean
  year: number | null
  indexCrime: CrimeCategoryStats
  nonIndexCrime: CrimeCategoryStats
  categoryBreakdown: CountItem[]
}

export const CRIME_ANALYTICS_STORAGE_KEY = "pro4a-command-crime-analytics-v2"
