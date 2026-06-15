export type IctPeriodBreakdown = {
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
  breakdown: IctPeriodBreakdown
}

export type IctStatusSection = {
  label: string
  breakdown: IctPeriodBreakdown
  detail: string
  offices: IctOfficeBreakdownItem[]
}

export type IctEquipmentAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  grandTotal: {
    label: string
    breakdown: IctPeriodBreakdown
  }
  serviceable: IctStatusSection
  unserviceable: IctStatusSection
  ber: IctStatusSection
  pnpIssuedByNhq: IctStatusSection
  procuredByPro: IctStatusSection
}

/** @deprecated Use IctPeriodBreakdown */
export type IctServiceableBreakdown = IctPeriodBreakdown
