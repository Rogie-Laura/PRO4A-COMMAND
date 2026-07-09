export const STATION_CLASSIFICATION_TYPES = [
  { id: "ccps", label: "CCPS", sheetName: "CCPS", shortLabel: "CCPS" },
  { id: "mps-a", label: "MPS A", sheetName: "Class A", shortLabel: "MPS A" },
  { id: "mps-b", label: "MPS B", sheetName: "Class B", shortLabel: "MPS B" },
  { id: "mps-c", label: "MPS C", sheetName: "Class C", shortLabel: "MPS C" },
] as const

export type StationClassificationTypeId = (typeof STATION_CLASSIFICATION_TYPES)[number]["id"]

export type StationClassificationUnit = {
  number: number
  name: string
}

export type StationClassificationPpoRow = {
  ppo: string
  ccps: number
  mpsA: number
  mpsB: number
  mpsC: number
}

export type StationClassificationTotals = {
  ccps: number
  mpsA: number
  mpsB: number
  mpsC: number
  stations: number
  pmfc: number
}

export type StationClassificationGroup = {
  id: StationClassificationTypeId
  label: string
  units: StationClassificationUnit[]
}

export type StationClassificationAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  asOfLabel: string
  ppoRows: StationClassificationPpoRow[]
  totals: StationClassificationTotals | null
  groups: StationClassificationGroup[]
  pmfcUnits: StationClassificationUnit[]
}

export type StationClassificationUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedStationClassificationWorkbook = {
  asOfLabel: string
  ppoRows: StationClassificationPpoRow[]
  totals: StationClassificationTotals
  groups: StationClassificationGroup[]
  pmfcUnits: StationClassificationUnit[]
  skippedSheets: string[]
}
