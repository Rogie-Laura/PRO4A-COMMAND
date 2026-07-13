import type { CountItem } from "@/lib/personnel-types"

export type AdminHoldingRecord = {
  no: number
  rank: string
  lastName: string
  firstName: string
  middleName: string
  formerUnit: string
  badgeNumber: string
  status: string
  authority: string
  remarks: string
}

export type AdminHoldingAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  total: number
  statusStats: CountItem[]
  records: AdminHoldingRecord[]
}

export type AdminHoldingSummary = Omit<AdminHoldingAnalytics, "records">

export type ParsedAdminHoldingWorkbook = {
  sheetName: string
  records: AdminHoldingRecord[]
}

export type AdminHoldingUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}
