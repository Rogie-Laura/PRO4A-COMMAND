export const TERRORISM_THREAT_REGION_LABEL = "CALABARZON REGION"

export type TerrorismThreatRow = {
  region: string
  threatLevel: string
  securityMeasure: string
  parameter: string
}

export type TerrorismThreatAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  periodLabel: string
  rows: TerrorismThreatRow[]
  note: string
}

export type TerrorismThreatUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedTerrorismThreatWorkbook = {
  periodLabel: string
  rows: TerrorismThreatRow[]
  note: string
}
