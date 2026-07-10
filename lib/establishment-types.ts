export const ESTABLISHMENT_PROVINCE_SHEETS = [
  "Cavite",
  "Laguna",
  "Batangas",
  "Rizal",
  "Quezon",
] as const

export type EstablishmentProvince = (typeof ESTABLISHMENT_PROVINCE_SHEETS)[number]

export type ParsedEstablishmentRecord = {
  province: EstablishmentProvince
  ppo: string
  station: string
  latitude: number
  longitude: number
  sectorNo: string
  establishmentType: string
  name: string
  location: string
  contactPerson: string
}

export type EstablishmentPpoBreakdown = {
  ppo: string
  count: number
}

export type EstablishmentTypeSummary = {
  typeKey: string
  establishmentType: string
  total: number
  ppoBreakdown: EstablishmentPpoBreakdown[]
}

export type EstablishmentAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  totalCount: number
  types: EstablishmentTypeSummary[]
}

export type EstablishmentUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  recordCount: number
  createdAt: string
}

export type ParsedEstablishmentWorkbook = {
  records: ParsedEstablishmentRecord[]
  skippedRows: number
}
