export type PpoUperRow = {
  ppo: string
  rankDesignation: string
  name: string
  dateDesignated: string
  kraPoints: number
  behaviorPoints: number
  compliancePoints: number
  totalPoints: number
  rating: string
  derivedRank: number
  derivedRankLabel: string
}

export type PpoUperMonthSnapshot = {
  monthKey: string
  monthLabel: string
  rows: PpoUperRow[]
}

export type PpoUperTrendPoint = {
  monthKey: string
  monthLabel: string
  shortLabel: string
  totalPoints: number
  derivedRank: number
  derivedRankLabel: string
  rating: string
}

export type PpoUperTrendSeries = {
  ppo: string
  points: PpoUperTrendPoint[]
}

export type PpoUperAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  currentMonth: {
    monthKey: string
    monthLabel: string
  } | null
  rankings: PpoUperRow[]
  months: PpoUperMonthSnapshot[]
  trendByPpo: PpoUperTrendSeries[]
}

export type PpoUperUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  monthCount: number
  createdAt: string
}

export type ParsedPpoUperWorkbook = {
  months: PpoUperMonthSnapshot[]
  skippedSheets: string[]
}
