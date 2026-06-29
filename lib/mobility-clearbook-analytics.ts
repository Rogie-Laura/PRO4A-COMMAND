import type {
  MobilityAnalytics,
  ParsedMobilityWorkbook,
  VehicleChartPoint,
  VehicleCountItem,
  VehicleOfficeBreakdownItem,
  VehicleSourceBreakdown,
  VehicleStatusBreakdown,
  VehicleUnitBreakdownItem,
} from "@/lib/mobility-types"

export function aggregateMobilitySourceBreakdown(
  units: VehicleUnitBreakdownItem[],
): VehicleSourceBreakdown {
  return units.reduce(
    (totals, unit) => ({
      organic: totals.organic + unit.source.organic,
      donated: totals.donated + unit.source.donated,
      loaned: totals.loaned + unit.source.loaned,
    }),
    { organic: 0, donated: 0, loaned: 0 },
  )
}

export function aggregateMobilityStatusBreakdown(
  units: VehicleUnitBreakdownItem[],
): VehicleStatusBreakdown {
  return units.reduce(
    (totals, unit) => ({
      svc: totals.svc + unit.status.svc,
      unsvc: totals.unsvc + unit.status.unsvc,
      ber: totals.ber + unit.status.ber,
    }),
    { svc: 0, unsvc: 0, ber: 0 },
  )
}

function buildFleetByType(workbook: ParsedMobilityWorkbook): VehicleCountItem[] {
  const totals = workbook.perClassification?.totals
  if (!totals) return []

  const grandTotal = workbook.clearbook.grandTotal || totals.total
  const items = [
    { name: "Patrol Vehicle", count: totals.patrolVehicle },
    { name: "Service/Utility Vehicle", count: totals.serviceUtility },
    { name: "Truck", count: totals.truck },
    { name: "Bus", count: totals.bus },
    { name: "Special Purpose Vehicle", count: totals.specialPurpose },
    { name: "Motorcycle", count: totals.motorcycle },
    { name: "Bike", count: totals.bike },
  ]

  return items
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      percentage: grandTotal > 0 ? Math.round((item.count / grandTotal) * 1000) / 10 : 0,
    }))
}

function buildOfficeBreakdown(workbook: ParsedMobilityWorkbook): VehicleOfficeBreakdownItem[] {
  const stationMap = new Map(workbook.unitStations.map((item) => [item.unitId, item.stations]))

  return workbook.clearbook.units.map((unit) => ({
    subUnit: unit.subUnit,
    label: unit.label,
    shortLabel: unit.shortLabel,
    logo: unit.logo,
    count: unit.total,
    colorClass: unit.colorClass,
    stations: (stationMap.get(unit.unitId) ?? []).map((station) => ({
      station: station.station,
      count: station.total,
      operational: station.status.svc,
      nonOperational: station.status.unsvc + station.status.ber,
    })),
  }))
}

export function buildMobilityAnalyticsFromWorkbook(
  workbook: ParsedMobilityWorkbook,
  lastUpdated = new Date().toISOString(),
): MobilityAnalytics {
  const { clearbook } = workbook
  const source = aggregateMobilitySourceBreakdown(clearbook.units)
  const status = aggregateMobilityStatusBreakdown(clearbook.units)

  const ownershipDistribution: VehicleChartPoint[] = [
    { name: "Organic", count: source.organic },
    { name: "Donated", count: source.donated },
    { name: "Loaned", count: source.loaned },
  ]

  const conditionDistribution: VehicleChartPoint[] = [
    { name: "Serviceable", count: status.svc },
    { name: "Unserviceable", count: status.unsvc },
    { name: "BER", count: status.ber },
  ]

  const fleetByType = buildFleetByType(workbook)

  return {
    lastUpdated,
    dataReady: true,
    dataSource: "clearbook-upload",
    clearbookAsOf: clearbook.asOf,
    clearbookUnits: clearbook.units,
    workbook: {
      quicklook: workbook.quicklook,
      perClassification: workbook.perClassification,
      wheelCounts: workbook.wheelCounts,
      patrolRecap: workbook.patrolRecap,
      unitVehicleTypes: workbook.unitVehicleTypes,
      unitStations: workbook.unitStations,
    },
    totalVehicles: {
      label: "Total Vehicles",
      value: clearbook.grandTotal.toLocaleString(),
      detail: clearbook.asOf
        ? `CLEARBOOK as of ${clearbook.asOf}`
        : "PRO CALABARZON CLEARBOOK summary",
    },
    officeBreakdown: buildOfficeBreakdown(workbook),
    ownershipDistribution,
    conditionDistribution,
    fleet: {
      operational: status.svc,
      nonOperational: status.unsvc + status.ber,
      byType: fleetByType,
      byStatus: conditionDistribution.map((item) => ({
        name: item.name,
        count: item.count,
        percentage:
          clearbook.grandTotal > 0
            ? Math.round((item.count / clearbook.grandTotal) * 1000) / 10
            : 0,
      })),
    },
  }
}

/** @deprecated Use buildMobilityAnalyticsFromWorkbook */
export function buildMobilityAnalyticsFromClearbook(
  clearbook: ParsedMobilityWorkbook["clearbook"],
  lastUpdated = new Date().toISOString(),
): MobilityAnalytics {
  return buildMobilityAnalyticsFromWorkbook({ clearbook, quicklook: null, perClassification: null, wheelCounts: null, patrolRecap: null, unitVehicleTypes: [], unitStations: [] }, lastUpdated)
}
