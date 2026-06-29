import type { FirearmsUnitId } from "@/lib/firearms-config"

export type FirearmsStatusBreakdown = {
  svc: number
  unsvc: number
  ber: number
}

export type FirearmsSourceBreakdown = {
  organic: number
  donated: number
  loaned: number
}

export type FirearmsUnitBreakdownItem = {
  unitId: FirearmsUnitId
  label: string
  shortLabel: string
  logo: string
  colorClass: string
  strength: number | null
  status: FirearmsStatusBreakdown
  total: number
  source: FirearmsSourceBreakdown
  sourceTotal: number
  fillRate: number | null
  isWarehouse: boolean
}

export type FirearmsCategorySummary = {
  id: "short" | "long"
  label: string
  grandTotal: number
  units: FirearmsUnitBreakdownItem[]
}

export type FirearmsAnalytics = {
  lastUpdated: string
  dataReady: boolean
  shortFirearms: FirearmsCategorySummary
  longFirearms: FirearmsCategorySummary
}

export type FirearmsUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}
