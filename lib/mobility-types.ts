export type VehicleRecord = {
  subUnit: string
  station: string
  vehicleType: string
  ownership: string
  condition: string
  status: string
  plateNumber: string
}

export type VehicleStatusBreakdown = {
  svc: number
  unsvc: number
  ber: number
}

export type VehicleSourceBreakdown = {
  organic: number
  donated: number
  loaned: number
}

export type VehicleUnitBreakdownItem = {
  unitId: string
  subUnit: string
  label: string
  shortLabel: string
  logo: string
  colorClass: string
  status: VehicleStatusBreakdown
  total: number
  source: VehicleSourceBreakdown
  sourceTotal: number
  requiredMobility: number | null
  fillRate: number | null
  variance: number | null
}

export type ParsedMobilityClearbook = {
  asOf: string | null
  grandTotal: number
  units: VehicleUnitBreakdownItem[]
}

export type MobilityUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type VehicleChartPoint = {
  name: string
  count: number
}

export type VehicleStationBreakdownItem = {
  station: string
  count: number
  operational: number
  nonOperational: number
}

export type VehicleOfficeBreakdownItem = {
  subUnit: string
  label: string
  shortLabel: string
  logo: string
  count: number
  colorClass: string
  stations: VehicleStationBreakdownItem[]
}

export type VehicleCountItem = {
  name: string
  count: number
  percentage: number
}

export type VehicleFleetSummary = {
  operational: number
  nonOperational: number
  byType: VehicleCountItem[]
  byStatus: VehicleCountItem[]
}

export type MobilityAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: "clearbook-upload" | "google-sheet"
  clearbookAsOf: string | null
  clearbookUnits: VehicleUnitBreakdownItem[]
  totalVehicles: {
    label: string
    value: string
    detail: string
  }
  officeBreakdown: VehicleOfficeBreakdownItem[]
  ownershipDistribution: VehicleChartPoint[]
  conditionDistribution: VehicleChartPoint[]
  fleet: VehicleFleetSummary
}
