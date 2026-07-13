export type DrugClearingStatusFilter = Exclude<DrugClearingBarangayStatus, "unknown">

export type DrugClearingBreakdownRow = {
  ppo: string
  municipality: string
  barangay: string
}

export type DrugClearingBarangayStatus =
  | "cleared"
  | "affected"
  | "unaffected"
  | "drug_free"
  | "unknown"

export type DrugClearingBarangay = {
  name: string
  status: DrugClearingBarangayStatus
}

export type DrugClearingMunicipality = {
  name: string
  totalBarangays: number
  cleared: number
  affected: number
  unaffected: number
  drugFree: number
  barangays: DrugClearingBarangay[]
}

export type DrugClearingRecapRow = {
  province: string
  citiesMunicipalities: number
  totalBarangays: number
  clearedBarangays: number
  remainingAffected: number
  unaffected: number
  drugFree: number
  isTotal?: boolean
}

export type DrugClearingProvince = {
  name: string
  municipalities: DrugClearingMunicipality[]
}

export type DrugClearingAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  recap: DrugClearingRecapRow[]
  provinces: DrugClearingProvince[]
}

export type DrugClearingUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedDrugClearingWorkbook = {
  recap: DrugClearingRecapRow[]
  provinces: DrugClearingProvince[]
}

export const DRUG_CLEARING_PROVINCES = [
  "Cavite",
  "Laguna",
  "Batangas",
  "Rizal",
  "Quezon",
] as const
