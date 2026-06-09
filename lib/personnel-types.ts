export type PersonnelRecord = {
  rank: string
  lastName: string
  firstName: string
  middleName: string
  badgeNumber: string
  birthDate: string
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
  label: string
  count: number
  percentage: number
  active: number
}

export type LeadershipRow = {
  id: string
  rank: string
  name: string
  designation: string
  vacant?: boolean
}

export type LeadershipGroups = {
  regionalCommandGroup: LeadershipRow[]
  rStaff: LeadershipRow[]
  provincialDirectors: LeadershipRow[]
}

export type StationBreakdownItem = {
  station: string
  uniformed: number
  pco: number
  pnco: number
  nup: number
}

export type OfficeBreakdownItem = {
  subUnit: string
  label: string
  shortLabel: string
  logo: string
  count: number
  colorClass: string
  stations: StationBreakdownItem[]
}

export type WorkforceSummary = {
  uniformed: {
    total: number
    pco: number
    pnco: number
  }
  nup: number
  gender: CountItem[]
}

export type RankDistribution = {
  pco: RankChartPoint[]
  pnco: RankChartPoint[]
}

export type OfficeAgeDistributionRow = {
  label: string
  subUnit: string
  brackets: Record<string, number>
  total: number
}

export type PersonnelAnalytics = {
  lastUpdated: string
  kpis: KpiMetric[]
  workforce: WorkforceSummary
  officeBreakdown: OfficeBreakdownItem[]
  rankDistribution: RankDistribution
  ageDistributionByOffice: OfficeAgeDistributionRow[]
  genderStats: CountItem[]
  statusStats: CountItem[]
  unitRows: UnitRow[]
  leadership: LeadershipGroups
}
