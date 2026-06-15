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
