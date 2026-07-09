export const UPER_FOCUS_OFFICE = "PRO 4A"

export type UperRankingRow = {
  office: string
  points: number
  rating: string
  rankNumber: number
  rankLabel: string
}

export type UperMonthSnapshot = {
  monthKey: string
  monthLabel: string
  rankings: UperRankingRow[]
}

export type UperFocusTrendPoint = {
  monthKey: string
  monthLabel: string
  shortLabel: string
  rankNumber: number
  rankLabel: string
  points: number
  rating: string
}

export type UperCurrentRanking = UperFocusTrendPoint & {
  totalPros: number
}

export type UperAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  focusOffice: string
  current: UperCurrentRanking | null
  trend: UperFocusTrendPoint[]
  months: UperMonthSnapshot[]
}

export type UperUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  monthCount: number
  createdAt: string
}

export type ParsedUperWorkbook = {
  months: UperMonthSnapshot[]
  skippedSheets: string[]
}
