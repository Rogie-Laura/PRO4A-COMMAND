export type VehicleRecord = {
  subUnit: string
  station: string
  vehicleType: string
  status: string
  plateNumber: string
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
  totalVehicles: {
    label: string
    value: string
    detail: string
  }
  officeBreakdown: VehicleOfficeBreakdownItem[]
  fleet: VehicleFleetSummary
}
