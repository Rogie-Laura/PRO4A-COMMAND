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

export type VehicleClassificationItem = {
  unitId: string
  label: string
  patrolVehicle: number
  serviceUtility: number
  truck: number
  bus: number
  specialPurpose: number
  motorcycle: number
  bike: number
  total: number
}

export type VehicleClassificationSummary = {
  asOf: string | null
  rows: VehicleClassificationItem[]
  totals: Omit<VehicleClassificationItem, "unitId" | "label">
}

export type VehicleWheelCountItem = {
  unitId: string
  label: string
  fourWheeled: number
  twoWheeled: number
  sixWheeled: number
  subtotal: number
  bike: number
  total: number
}

export type VehicleWheelCountSummary = {
  rows: VehicleWheelCountItem[]
  totals: Omit<VehicleWheelCountItem, "unitId" | "label">
}

export type QuicklookAssetBreakdown = {
  serviceable: VehicleSourceBreakdown
  unserviceable: VehicleSourceBreakdown
  ber: VehicleSourceBreakdown
  total: number
}

export type QuicklookUnitRow = {
  unitId: string
  label: string
  land: QuicklookAssetBreakdown
  water: QuicklookAssetBreakdown
  combinedTotal: number
}

export type QuicklookSummary = {
  asOf: string | null
  rows: QuicklookUnitRow[]
  landTotals: QuicklookAssetBreakdown
  waterTotals: QuicklookAssetBreakdown
  grandTotal: number
}

export type VehicleTypeStatusBreakdown = {
  serviceable: VehicleSourceBreakdown
  unserviceable: VehicleSourceBreakdown
  ber: VehicleSourceBreakdown
  total: number
}

export type UnitVehicleTypeItem = {
  vehicleType: string
  breakdown: VehicleTypeStatusBreakdown
}

export type UnitVehicleTypeBreakdown = {
  unitId: string
  label: string
  asOf: string | null
  vehicleTypes: UnitVehicleTypeItem[]
  landTotal: number
  waterTotal: number
}

export type StationMobilityItem = {
  station: string
  status: VehicleStatusBreakdown
  total: number
  source: VehicleSourceBreakdown
}

export type UnitStationBreakdown = {
  unitId: string
  label: string
  stations: StationMobilityItem[]
}

export type PatrolRecapSourceBreakdown = {
  svc: number
  unsvc: number
  ber: number
  subtotal: number
}

export type PatrolRecapItem = {
  vehicleType: string
  organic: PatrolRecapSourceBreakdown
  donated: PatrolRecapSourceBreakdown
  loaned: PatrolRecapSourceBreakdown
  grandTotal: number
}

export type PatrolRecapSummary = {
  rows: PatrolRecapItem[]
  grandTotal: number
}

export type ParsedMobilityWorkbook = {
  clearbook: ParsedMobilityClearbook
  quicklook: QuicklookSummary | null
  perClassification: VehicleClassificationSummary | null
  wheelCounts: VehicleWheelCountSummary | null
  patrolRecap: PatrolRecapSummary | null
  unitVehicleTypes: UnitVehicleTypeBreakdown[]
  unitStations: UnitStationBreakdown[]
}

export type MobilityWorkbookAnalytics = {
  quicklook: QuicklookSummary | null
  perClassification: VehicleClassificationSummary | null
  wheelCounts: VehicleWheelCountSummary | null
  patrolRecap: PatrolRecapSummary | null
  unitVehicleTypes: UnitVehicleTypeBreakdown[]
  unitStations: UnitStationBreakdown[]
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
  workbook: MobilityWorkbookAnalytics | null
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
