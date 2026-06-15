export type IctServiceableBreakdown = {
  year2025Below: number
  asOfJanuary2026: number
  total: number
}

export type IctOfficeBreakdownItem = {
  subUnit: string
  label: string
  shortLabel: string
  logo: string
  colorClass: string
  count: number
  breakdown: IctServiceableBreakdown
}

export type IctEquipmentAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  serviceable: {
    label: string
    breakdown: IctServiceableBreakdown
    detail: string
    offices: IctOfficeBreakdownItem[]
  }
}
