export type DetailedPersonnelRecord = {
  no: number
  rank: string
  lastName: string
  firstName: string
  middleName: string
  qlfr: string
  badgeNumber: string
  designation: string
  effDate: string
  endDate: string
  unitFrom: string
  unitTo: string
  authority: string
  daysRemaining: string
}

export type DetailedPersonnelAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  title: string
  total: number
  records: DetailedPersonnelRecord[]
}

/** Lightweight card payload for detailed personnel tabs. */
export type DetailedPersonnelSummary = Omit<DetailedPersonnelAnalytics, "records">

export type DetailedPersonnelTabKey = "nhq" | "nosus" | "rsu" | "rhqPpo"
