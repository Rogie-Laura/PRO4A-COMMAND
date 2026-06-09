export type PersonnelRecord = {
  rank: string
  lastName: string
  firstName: string
  middleName: string
  badgeNumber: string
  designation: string
  pStatus: string
  gender: string
  civilStatus: string
  unit: string
  subUnit: string
  station: string
}

export type KpiMetric = {
  id: string
  label: string
  value: string
  detail: string
}

export type CountItem = {
  name: string
  count: number
  percentage: number
}

export type RankChartPoint = {
  rank: string
  count: number
}

export type UnitRow = {
  unit: string
  count: number
  percentage: number
  active: number
}

export type LeadershipRow = {
  id: string
  rank: string
  name: string
  designation: string
  subUnit: string
  status: string
}

export type PersonnelAnalytics = {
  lastUpdated: string
  kpis: KpiMetric[]
  rankChart: RankChartPoint[]
  genderStats: CountItem[]
  statusStats: CountItem[]
  unitRows: UnitRow[]
  leadership: LeadershipRow[]
}
