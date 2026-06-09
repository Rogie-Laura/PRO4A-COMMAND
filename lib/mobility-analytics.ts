import { fetchMobilitySheetCsv, parseCsv } from "@/lib/google-sheets"
import {
  VEHICLE_CONDITION_CATEGORIES,
  VEHICLE_OWNERSHIP_CATEGORIES,
  classifyVehicleCondition,
  classifyVehicleOwnership,
} from "@/lib/mobility-config"
import { OFFICES } from "@/lib/office-config"
import type {
  MobilityAnalytics,
  VehicleCountItem,
  VehicleChartPoint,
  VehicleFleetSummary,
  VehicleOfficeBreakdownItem,
  VehicleRecord,
  VehicleStationBreakdownItem,
} from "@/lib/mobility-types"
import { formatStationLabel } from "@/lib/station-labels"
import { sortStationBreakdown } from "@/lib/station-sort"

const VEHICLE_HEADER_PATTERNS = [
  /plate/i,
  /vehicle/i,
  /motor/i,
  /chassis/i,
  /engine/i,
  /mv file/i,
]

function pickField(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]?.trim()
    if (value) return value
  }
  return ""
}

function isPersonnelSheetRow(row: Record<string, string>) {
  return Boolean(row.Rank?.trim() && row["Last Name"]?.trim())
}

function looksLikeVehicleSheet(rows: Record<string, string>[]) {
  if (rows.length === 0) return false

  const headers = Object.keys(rows[0])
  if (headers.some((header) => VEHICLE_HEADER_PATTERNS.some((pattern) => pattern.test(header)))) {
    return true
  }

  const sample = rows.slice(0, 20)
  return sample.some((row) => !isPersonnelSheetRow(row) && Boolean(pickField(row, ["Sub Unit", "Plate Number", "Plate No", "Plate"])))
}

function mapVehicleRow(row: Record<string, string>): VehicleRecord | null {
  if (isPersonnelSheetRow(row)) return null

  const subUnit = pickField(row, ["Sub Unit"])
  const plateNumber = pickField(row, ["Plate Number", "Plate No", "Plate", "MV File No", "MV File Number"])
  const station = pickField(row, ["Station"])
  const vehicleType = pickField(row, ["Vehicle Type", "Type", "Category", "Vehicle Category", "Unit Type"])
  const ownership = pickField(row, [
    "Ownership",
    "Vehicle Ownership",
    "Source",
    "Acquisition",
    "Fund Source",
    "Funding Source",
  ])
  const condition = pickField(row, [
    "Condition",
    "Serviceability",
    "Operational Status",
    "Vehicle Condition",
  ])
  const status = pickField(row, ["Status", "Vehicle Status", "Condition", "Serviceability"])

  if (!subUnit && !plateNumber) return null

  return {
    subUnit,
    station,
    vehicleType: vehicleType || "Unspecified",
    ownership,
    condition: condition || status,
    status: status || "Unknown",
    plateNumber,
  }
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>()

  for (const item of items) {
    const key = keyFn(item).trim() || "Unknown"
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return counts
}

function toCountItems(counts: Map<string, number>, total: number, limit = 6): VehicleCountItem[] {
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function isOperationalStatus(status: string) {
  const normalized = status.trim().toUpperCase()
  if (!normalized || normalized === "UNKNOWN") return false

  if (
    /NON[- ]?OPER|UNSERVICE|FOR REPAIR|CONDEMN|SCRAP|MISSING|STOLEN|DISPOSE/i.test(
      normalized,
    )
  ) {
    return false
  }

  return /OPER|SERVICE|ACTIVE|GOOD|RUNNING|AVAILABLE|ON DUTY/i.test(normalized)
}

function buildStationBreakdown(
  records: VehicleRecord[],
  subUnit: string,
): VehicleStationBreakdownItem[] {
  const officeRecords = records.filter((record) => record.subUnit === subUnit)
  const grouped = new Map<string, { operational: number; nonOperational: number }>()

  for (const record of officeRecords) {
    const station = record.station.trim() || "Unassigned"
    const entry = grouped.get(station) ?? { operational: 0, nonOperational: 0 }

    if (isOperationalStatus(record.status)) {
      entry.operational += 1
    } else {
      entry.nonOperational += 1
    }

    grouped.set(station, entry)
  }

  return sortStationBreakdown(
    [...grouped.entries()]
      .map(([rawStation, counts]) => ({
        station: formatStationLabel(rawStation),
        count: counts.operational + counts.nonOperational,
        operational: counts.operational,
        nonOperational: counts.nonOperational,
      }))
      .filter((item) => item.count > 0),
  )
}

function buildOfficeBreakdown(records: VehicleRecord[]): VehicleOfficeBreakdownItem[] {
  const counts = countBy(records, (record) => record.subUnit)

  return OFFICES.map((office) => ({
    subUnit: office.subUnit,
    label: office.label,
    shortLabel: office.shortLabel,
    logo: office.logo,
    count: counts.get(office.subUnit) ?? 0,
    colorClass: office.colorClass,
    stations: buildStationBreakdown(records, office.subUnit),
  }))
}

function buildCategoryDistribution<T extends string>(
  records: VehicleRecord[],
  categories: readonly { id: T; label: string }[],
  classify: (value: string) => T | null,
  getValue: (record: VehicleRecord) => string,
): VehicleChartPoint[] {
  const counts = Object.fromEntries(categories.map((category) => [category.id, 0])) as Record<
    T,
    number
  >

  for (const record of records) {
    const categoryId = classify(getValue(record))
    if (categoryId) {
      counts[categoryId] += 1
    }
  }

  return categories.map((category) => ({
    name: category.label,
    count: counts[category.id],
  }))
}

function buildOwnershipDistribution(records: VehicleRecord[]): VehicleChartPoint[] {
  return buildCategoryDistribution(
    records,
    VEHICLE_OWNERSHIP_CATEGORIES,
    classifyVehicleOwnership,
    (record) => record.ownership,
  )
}

function buildConditionDistribution(records: VehicleRecord[]): VehicleChartPoint[] {
  return buildCategoryDistribution(
    records,
    VEHICLE_CONDITION_CATEGORIES,
    classifyVehicleCondition,
    (record) => record.condition || record.status,
  )
}

function emptyCategoryDistribution(
  categories: readonly { label: string }[],
): VehicleChartPoint[] {
  return categories.map((category) => ({ name: category.label, count: 0 }))
}

function buildFleetSummary(records: VehicleRecord[]): VehicleFleetSummary {
  const total = records.length
  const operational = records.filter((record) => isOperationalStatus(record.status)).length

  return {
    operational,
    nonOperational: total - operational,
    byType: toCountItems(countBy(records, (record) => record.vehicleType), total),
    byStatus: toCountItems(countBy(records, (record) => record.status), total),
  }
}

function emptyAnalytics(): MobilityAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    totalVehicles: {
      label: "Total Vehicles",
      value: "0",
      detail: "PRO CALABARZON fleet registry",
    },
    officeBreakdown: OFFICES.map((office) => ({
      subUnit: office.subUnit,
      label: office.label,
      shortLabel: office.shortLabel,
      logo: office.logo,
      count: 0,
      colorClass: office.colorClass,
      stations: [],
    })),
    ownershipDistribution: emptyCategoryDistribution(VEHICLE_OWNERSHIP_CATEGORIES),
    conditionDistribution: emptyCategoryDistribution(VEHICLE_CONDITION_CATEGORIES),
    fleet: {
      operational: 0,
      nonOperational: 0,
      byType: [],
      byStatus: [],
    },
  }
}

export async function getMobilityAnalytics(): Promise<MobilityAnalytics> {
  try {
    const csv = await fetchMobilitySheetCsv()
    const rows = parseCsv(csv)

    if (!looksLikeVehicleSheet(rows)) {
      return emptyAnalytics()
    }

    const records = rows
      .map(mapVehicleRow)
      .filter((record): record is VehicleRecord => record !== null)

    if (records.length === 0) {
      return emptyAnalytics()
    }

    const fleet = buildFleetSummary(records)

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      totalVehicles: {
        label: "Total Vehicles",
        value: records.length.toLocaleString(),
        detail: "PRO CALABARZON fleet registry",
      },
      officeBreakdown: buildOfficeBreakdown(records),
      ownershipDistribution: buildOwnershipDistribution(records),
      conditionDistribution: buildConditionDistribution(records),
      fleet,
    }
  } catch {
    return emptyAnalytics()
  }
}
