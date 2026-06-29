import type {
  MobilityAnalytics,
  ParsedMobilityClearbook,
  VehicleChartPoint,
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

export function buildMobilityAnalyticsFromClearbook(
  clearbook: ParsedMobilityClearbook,
  lastUpdated = new Date().toISOString(),
): MobilityAnalytics {
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

  const officeBreakdown: VehicleOfficeBreakdownItem[] = clearbook.units.map((unit) => ({
    subUnit: unit.subUnit,
    label: unit.label,
    shortLabel: unit.shortLabel,
    logo: unit.logo,
    count: unit.total,
    colorClass: unit.colorClass,
    stations: [],
  }))

  return {
    lastUpdated,
    dataReady: true,
    dataSource: "clearbook-upload",
    clearbookAsOf: clearbook.asOf,
    clearbookUnits: clearbook.units,
    totalVehicles: {
      label: "Total Vehicles",
      value: clearbook.grandTotal.toLocaleString(),
      detail: clearbook.asOf
        ? `CLEARBOOK as of ${clearbook.asOf}`
        : "PRO CALABARZON CLEARBOOK summary",
    },
    officeBreakdown,
    ownershipDistribution,
    conditionDistribution,
    fleet: {
      operational: status.svc,
      nonOperational: status.unsvc + status.ber,
      byType: [],
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
