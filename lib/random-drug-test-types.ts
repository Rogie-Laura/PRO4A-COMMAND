export type RandomDrugTestRow = {
  unit: string
  totalStrength: number
  negative: number
  positive: number
  isTotal?: boolean
}

export type RandomDrugTestAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  title: string
  periodLabel: string
  note: string
  rows: RandomDrugTestRow[]
}

export type RandomDrugTestUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedRandomDrugTestWorkbook = {
  title: string
  periodLabel: string
  note: string
  rows: RandomDrugTestRow[]
}
