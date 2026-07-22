export type RcdRetireeRecord = {
  id: string
  year: number
  number: number | null
  name: string
  unit: string
  retirementDate: string
  calClaim: string
  lumpSumClaim: string
  remarks: string
  notes: string
  isComplete: boolean
}

export type RcdYearGroup = {
  year: number
  asOf: string
  title: string
  total: number
  completed: number
  lacking: number
  retirees: RcdRetireeRecord[]
}

export type RcdAnalytics = {
  dataReady: boolean
  dataSource: string
  lastUpdated: string
  asOf: string
  totalRetirees: number
  completedCount: number
  lackingCount: number
  years: RcdYearGroup[]
}

export type ParsedRcdWorkbook = {
  sheetNames: string[]
  analytics: RcdAnalytics
}

export type RcdUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}
