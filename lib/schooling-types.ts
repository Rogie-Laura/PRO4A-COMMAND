import type { CountItem } from "@/lib/personnel-types"

export type SchoolingRecord = {
  no: number
  rank: string
  lastName: string
  firstName: string
  middleName: string
  qlfr: string
  badgeNumber: string
  subUnit: string
  unitOffice: string
  effectiveDate: string
  course: string
  courseSchool: string
  authority: string
}

export type SchoolingAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  title: string
  total: number
  subUnitStats: CountItem[]
  courseStats: CountItem[]
  records: SchoolingRecord[]
}

/** Lightweight schooling payload for dashboard cards (no personnel records). */
export type SchoolingSummary = Omit<SchoolingAnalytics, "records">

export type SchoolingTabKey = "mandatory" | "specialized"
