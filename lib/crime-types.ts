import type { CountItem } from "@/lib/personnel-types"

export type CrimeAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  year: number | null
  totalVolume: number
  coveredPeriodStart: string | null
  coveredPeriodEnd: string | null
  ppoBreakdown: CountItem[]
  crimeBreakdown: CountItem[]
  statusBreakdown: CountItem[]
}

export const CRIME_ANALYTICS_STORAGE_KEY = "pro4a-command-crime-analytics-v2"
