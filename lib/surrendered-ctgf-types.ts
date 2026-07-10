export type SurrenderedCtgfCountSet = {
  psr: number
  npsr: number
  total: number
}

export type SurrenderedCtgfProvinceRow = {
  province: string
  arrested: SurrenderedCtgfCountSet
  died: SurrenderedCtgfCountSet
  surrendered: SurrenderedCtgfCountSet
  grandTotal: SurrenderedCtgfCountSet
  isTotal: boolean
}

export type SurrenderedCtgfAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  title: string
  periodLabel: string
  note: string
  rows: SurrenderedCtgfProvinceRow[]
}

export type SurrenderedCtgfUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedSurrenderedCtgfWorkbook = {
  title: string
  periodLabel: string
  note: string
  rows: SurrenderedCtgfProvinceRow[]
}
