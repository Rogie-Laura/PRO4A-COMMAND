export type RhsuDecalMonth = {
  month: string
  passcards: number
  stickers: number
  total: number
}

export type RhsuPurcMonth = {
  month: string
  count: number
}

export type RhsuAnalytics = {
  dataReady: boolean
  dataSource: string
  lastUpdated: string
  asOf: string
  decalsByMonth: RhsuDecalMonth[]
  decalsTotals: {
    passcards: number
    stickers: number
    total: number
  }
  decalStatus: {
    applied: number
    claimedReleased: number
    unclaimed: number
  }
  purcsByMonth: RhsuPurcMonth[]
  purcsTotal: number
}

export type ParsedRhsuWorkbook = {
  sheetNames: string[]
  analytics: RhsuAnalytics
}

export type RhsuUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}
