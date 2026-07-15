export type CommunityMobilizationBarangayStatus = "mobilized" | "not_yet_mobilized"

export type CommunityMobilizationBreakdownRow = {
  ppo: string
  municipality: string
  barangay: string
}

export type CommunityMobilizationBarangay = {
  name: string
  status: CommunityMobilizationBarangayStatus
}

export type CommunityMobilizationMunicipality = {
  name: string
  totalBarangays: number
  mobilized: number
  remaining: number
  compliancePct: number | null
  barangays: CommunityMobilizationBarangay[]
}

export type CommunityMobilizationRecapRow = {
  province: string
  totalBarangays: number
  mobilized: number
  remaining: number
  compliancePct: number | null
  yearBreakdown: Record<string, number>
  isTotal?: boolean
}

export type CommunityMobilizationProvince = {
  name: string
  municipalities: CommunityMobilizationMunicipality[]
}

export type CommunityMobilizationAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  asOfLabel: string | null
  recap: CommunityMobilizationRecapRow[]
  provinces: CommunityMobilizationProvince[]
}

export type CommunityMobilizationUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedCommunityMobilizationWorkbook = {
  asOfLabel: string | null
  recap: CommunityMobilizationRecapRow[]
  provinces: CommunityMobilizationProvince[]
}

export const COMMUNITY_MOBILIZATION_PROVINCES = [
  "Cavite",
  "Laguna",
  "Batangas",
  "Rizal",
  "Quezon",
] as const

export type CommunityMobilizationProvinceName =
  (typeof COMMUNITY_MOBILIZATION_PROVINCES)[number]
