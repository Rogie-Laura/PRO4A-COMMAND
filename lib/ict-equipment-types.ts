export type IctPeriodBreakdown = {
  year2025Below: number
  asOfJanuary2026: number
  total: number
}

export type IctCybereasonBreakdown = {
  installed: number
  without: number
  total: number
}

export type IctStorageBreakdown = {
  hddOrHybrid: number
  ssdOnly: number
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
  cybereason?: IctCybereasonBreakdown
  storage?: IctStorageBreakdown
}

export type IctStatusSection = {
  label: string
  breakdown: IctPeriodBreakdown
  detail: string
  offices: IctOfficeBreakdownItem[]
  cybereason?: IctCybereasonBreakdown
  storage?: IctStorageBreakdown
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

export type ParsedIctRecapWorkbook = {
  sheetName: string
  analytics: IctEquipmentAnalytics
}

export type IctEquipmentUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

/** @deprecated Use IctPeriodBreakdown */
export type IctServiceableBreakdown = IctPeriodBreakdown
