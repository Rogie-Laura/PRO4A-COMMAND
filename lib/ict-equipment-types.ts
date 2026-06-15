export type IctGrandTotalBreakdown = {
  year2025Below: number
  asOfJanuary2026: number
  total: number
}

export type IctEquipmentAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  grandTotal: {
    label: string
    breakdown: IctGrandTotalBreakdown
    detail: string
  }
}
