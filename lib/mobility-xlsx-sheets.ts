import * as XLSX from "xlsx"

import {
  getMobilityUnitPresentation,
  MOBILITY_STATION_SHEETS,
  MOBILITY_UNIT_ORDER,
  MOBILITY_UNIT_PPO_SHEETS,
  MOBILITY_WORKBOOK_SHEETS,
  normalizeMobilityUnitKey,
  type MobilityUnitId,
} from "@/lib/mobility-clearbook-config"
import type {
  ParsedMobilityClearbook,
  PatrolRecapItem,
  PatrolRecapSourceBreakdown,
  PatrolRecapSummary,
  QuicklookAssetBreakdown,
  QuicklookSummary,
  QuicklookUnitRow,
  StationMobilityItem,
  UnitStationBreakdown,
  UnitVehicleTypeBreakdown,
  UnitVehicleTypeItem,
  VehicleClassificationItem,
  VehicleClassificationSummary,
  VehicleSourceBreakdown,
  VehicleUnitBreakdownItem,
  VehicleWheelCountItem,
  VehicleWheelCountSummary,
  VehicleTypeStatusBreakdown,
} from "@/lib/mobility-types"
import {
  parseAsOfFromRows,
  parseMobilityFillRate,
  parseMobilityNumber,
  parseMobilityOptionalNumber,
  readMobilityCell,
  sheetRows,
} from "@/lib/mobility-xlsx-utils"

function readSource(row: unknown[], start: number): VehicleSourceBreakdown {
  return {
    organic: parseMobilityNumber(readMobilityCell(row, start)),
    donated: parseMobilityNumber(readMobilityCell(row, start + 1)),
    loaned: parseMobilityNumber(readMobilityCell(row, start + 2)),
  }
}

function readStatus(row: unknown[], start: number) {
  return {
    svc: parseMobilityNumber(readMobilityCell(row, start)),
    unsvc: parseMobilityNumber(readMobilityCell(row, start + 1)),
    ber: parseMobilityNumber(readMobilityCell(row, start + 2)),
  }
}

function readQuicklookAsset(row: unknown[]): QuicklookAssetBreakdown {
  return {
    serviceable: readSource(row, 1),
    unserviceable: readSource(row, 5),
    ber: readSource(row, 9),
    total: parseMobilityNumber(readMobilityCell(row, 13)),
  }
}

function isSkippableLabel(label: string) {
  const upper = label.toUpperCase()
  return (
    !upper ||
    upper === "TOTAL" ||
    upper === "SUB-TOTAL" ||
    upper === "GRAND TOTAL" ||
    upper.includes("LAND ASSET") ||
    upper.includes("WATER ASSET") ||
    upper.includes("PATROL VEHICLES")
  )
}

function parseUnitRow(row: unknown[]): VehicleUnitBreakdownItem | null {
  const rawLabel = String(readMobilityCell(row, 0) ?? "").trim()
  if (isSkippableLabel(rawLabel)) return null

  const unitId = normalizeMobilityUnitKey(rawLabel)
  if (!unitId) return null

  const presentation = getMobilityUnitPresentation(unitId)

  return {
    unitId,
    subUnit: presentation.subUnit,
    label: presentation.label,
    shortLabel: presentation.shortLabel,
    logo: presentation.logo,
    colorClass: presentation.colorClass,
    status: readStatus(row, 1),
    total: parseMobilityNumber(readMobilityCell(row, 4)),
    source: readSource(row, 5),
    sourceTotal: parseMobilityNumber(readMobilityCell(row, 8)),
    requiredMobility: parseMobilityOptionalNumber(readMobilityCell(row, 9)),
    fillRate: parseMobilityFillRate(readMobilityCell(row, 10)),
    variance: parseMobilityOptionalNumber(readMobilityCell(row, 11)),
  }
}

export function parseClearbookSheet(rows: unknown[][]): ParsedMobilityClearbook {
  const dataRows: unknown[][] = []
  for (const row of rows.slice(3)) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim().toUpperCase()
    if (label === "TOTAL" || label === "GRAND TOTAL") break
    dataRows.push(row)
  }

  const parsedUnits = dataRows
    .map((row) => parseUnitRow(row))
    .filter((item): item is VehicleUnitBreakdownItem => item !== null)

  const byId = new Map(parsedUnits.map((item) => [item.unitId, item]))
  const units = MOBILITY_UNIT_ORDER.map((unitId) => {
    const existing = byId.get(unitId)
    if (existing) return existing

    const presentation = getMobilityUnitPresentation(unitId)
    return {
      unitId,
      subUnit: presentation.subUnit,
      label: presentation.label,
      shortLabel: presentation.shortLabel,
      logo: presentation.logo,
      colorClass: presentation.colorClass,
      status: { svc: 0, unsvc: 0, ber: 0 },
      total: 0,
      source: { organic: 0, donated: 0, loaned: 0 },
      sourceTotal: 0,
      requiredMobility: null,
      fillRate: null,
      variance: null,
    }
  })

  let grandTotal = 0
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim().toUpperCase()
    if (label === "TOTAL" || label === "GRAND TOTAL") {
      grandTotal = parseMobilityNumber(readMobilityCell(row, 4))
      break
    }
  }

  return {
    asOf: parseAsOfFromRows(rows),
    grandTotal: grandTotal || units.reduce((sum, item) => sum + item.total, 0),
    units,
  }
}

export function parseQuicklookSheet(rows: unknown[][]): QuicklookSummary | null {
  const landRows: QuicklookUnitRow[] = []
  const waterByUnit = new Map<string, QuicklookAssetBreakdown>()

  let section: "none" | "land" | "water" = "none"

  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim()
    const upper = label.toUpperCase()

    if (upper.includes("LAND ASSET")) {
      section = "land"
      continue
    }
    if (upper.includes("WATER ASSET")) {
      section = "water"
      continue
    }
    if (upper === "TOTAL" || upper === "GRAND TOTAL") {
      continue
    }

    const unitId = normalizeMobilityUnitKey(label)
    if (!unitId) continue

    const presentation = getMobilityUnitPresentation(unitId)
    const asset = readQuicklookAsset(row)

    if (section === "land") {
      landRows.push({
        unitId,
        label: presentation.label,
        land: asset,
        water: {
          serviceable: { organic: 0, donated: 0, loaned: 0 },
          unserviceable: { organic: 0, donated: 0, loaned: 0 },
          ber: { organic: 0, donated: 0, loaned: 0 },
          total: 0,
        },
        combinedTotal: asset.total,
      })
    }

    if (section === "water") {
      waterByUnit.set(unitId, asset)
    }
  }

  if (landRows.length === 0) return null

  const mergedRows = landRows.map((row) => {
    const water = waterByUnit.get(row.unitId) ?? row.water
    return {
      ...row,
      water,
      combinedTotal: row.land.total + water.total,
    }
  })

  const sumAsset = (items: QuicklookUnitRow[], key: "land" | "water"): QuicklookAssetBreakdown =>
    items.reduce(
      (acc, row) => {
        const asset = row[key]
        return {
          serviceable: {
            organic: acc.serviceable.organic + asset.serviceable.organic,
            donated: acc.serviceable.donated + asset.serviceable.donated,
            loaned: acc.serviceable.loaned + asset.serviceable.loaned,
          },
          unserviceable: {
            organic: acc.unserviceable.organic + asset.unserviceable.organic,
            donated: acc.unserviceable.donated + asset.unserviceable.donated,
            loaned: acc.unserviceable.loaned + asset.unserviceable.loaned,
          },
          ber: {
            organic: acc.ber.organic + asset.ber.organic,
            donated: acc.ber.donated + asset.ber.donated,
            loaned: acc.ber.loaned + asset.ber.loaned,
          },
          total: acc.total + asset.total,
        }
      },
      {
        serviceable: { organic: 0, donated: 0, loaned: 0 },
        unserviceable: { organic: 0, donated: 0, loaned: 0 },
        ber: { organic: 0, donated: 0, loaned: 0 },
        total: 0,
      },
    )

  return {
    asOf: parseAsOfFromRows(rows),
    rows: mergedRows,
    landTotals: sumAsset(mergedRows, "land"),
    waterTotals: sumAsset(mergedRows, "water"),
    grandTotal: mergedRows.reduce((sum, row) => sum + row.land.total, 0),
  }
}

export function parsePerClassificationSheet(rows: unknown[][]): VehicleClassificationSummary | null {
  const parsedRows: VehicleClassificationItem[] = []

  for (const row of rows.slice(2)) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim()
    if (isSkippableLabel(label)) continue

    const unitId = normalizeMobilityUnitKey(label)
    if (!unitId) continue

    const presentation = getMobilityUnitPresentation(unitId)
    parsedRows.push({
      unitId,
      label: presentation.label,
      patrolVehicle: parseMobilityNumber(readMobilityCell(row, 1)),
      serviceUtility: parseMobilityNumber(readMobilityCell(row, 2)),
      truck: parseMobilityNumber(readMobilityCell(row, 3)),
      bus: parseMobilityNumber(readMobilityCell(row, 4)),
      specialPurpose: parseMobilityNumber(readMobilityCell(row, 5)),
      motorcycle: parseMobilityNumber(readMobilityCell(row, 6)),
      bike: parseMobilityNumber(readMobilityCell(row, 7)),
      total: parseMobilityNumber(readMobilityCell(row, 8)),
    })
  }

  if (parsedRows.length === 0) return null

  const totals = parsedRows.reduce(
    (acc, row) => ({
      patrolVehicle: acc.patrolVehicle + row.patrolVehicle,
      serviceUtility: acc.serviceUtility + row.serviceUtility,
      truck: acc.truck + row.truck,
      bus: acc.bus + row.bus,
      specialPurpose: acc.specialPurpose + row.specialPurpose,
      motorcycle: acc.motorcycle + row.motorcycle,
      bike: acc.bike + row.bike,
      total: acc.total + row.total,
    }),
    {
      patrolVehicle: 0,
      serviceUtility: 0,
      truck: 0,
      bus: 0,
      specialPurpose: 0,
      motorcycle: 0,
      bike: 0,
      total: 0,
    },
  )

  return {
    asOf: parseAsOfFromRows(rows),
    rows: parsedRows,
    totals,
  }
}

export function parseWheelCountSheet(rows: unknown[][]): VehicleWheelCountSummary | null {
  const parsedRows: VehicleWheelCountItem[] = []

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim()
    if (isSkippableLabel(label)) continue

    const unitId = normalizeMobilityUnitKey(label)
    if (!unitId) continue

    const presentation = getMobilityUnitPresentation(unitId)
    parsedRows.push({
      unitId,
      label: presentation.label,
      fourWheeled: parseMobilityNumber(readMobilityCell(row, 1)),
      twoWheeled: parseMobilityNumber(readMobilityCell(row, 2)),
      sixWheeled: parseMobilityNumber(readMobilityCell(row, 3)),
      subtotal: parseMobilityNumber(readMobilityCell(row, 4)),
      bike: parseMobilityNumber(readMobilityCell(row, 5)),
      total: parseMobilityNumber(readMobilityCell(row, 6)),
    })
  }

  if (parsedRows.length === 0) return null

  const totals = parsedRows.reduce(
    (acc, row) => ({
      fourWheeled: acc.fourWheeled + row.fourWheeled,
      twoWheeled: acc.twoWheeled + row.twoWheeled,
      sixWheeled: acc.sixWheeled + row.sixWheeled,
      subtotal: acc.subtotal + row.subtotal,
      bike: acc.bike + row.bike,
      total: acc.total + row.total,
    }),
    { fourWheeled: 0, twoWheeled: 0, sixWheeled: 0, subtotal: 0, bike: 0, total: 0 },
  )

  return { rows: parsedRows, totals }
}

function readPatrolRecapSource(row: unknown[], start: number): PatrolRecapSourceBreakdown {
  return {
    svc: parseMobilityNumber(readMobilityCell(row, start)),
    unsvc: parseMobilityNumber(readMobilityCell(row, start + 1)),
    ber: parseMobilityNumber(readMobilityCell(row, start + 2)),
    subtotal: parseMobilityNumber(readMobilityCell(row, start + 3)),
  }
}

export function parsePatrolRecapSheet(rows: unknown[][]): PatrolRecapSummary | null {
  const parsedRows: PatrolRecapItem[] = []

  for (const row of rows.slice(4)) {
    if (!Array.isArray(row)) continue
    const vehicleType = String(readMobilityCell(row, 0) ?? "").trim()
    if (!vehicleType) continue
    if (vehicleType.toUpperCase().includes("UNIT/OFFICE")) continue

    parsedRows.push({
      vehicleType,
      organic: readPatrolRecapSource(row, 1),
      donated: readPatrolRecapSource(row, 5),
      loaned: readPatrolRecapSource(row, 10),
      grandTotal: parseMobilityNumber(readMobilityCell(row, 14)),
    })
  }

  if (parsedRows.length === 0) return null

  const totalRow = parsedRows.find((row) => row.vehicleType.toUpperCase() === "TOTAL")

  return {
    rows: parsedRows.filter((row) => row.vehicleType.toUpperCase() !== "TOTAL" && row.grandTotal > 0),
    grandTotal: totalRow?.grandTotal ?? 0,
  }
}

function readVehicleTypeBreakdown(row: unknown[]): VehicleTypeStatusBreakdown {
  return {
    serviceable: readSource(row, 1),
    unserviceable: readSource(row, 5),
    ber: readSource(row, 9),
    total: parseMobilityNumber(readMobilityCell(row, 13)),
  }
}

export function parseUnitPpoSheet(rows: unknown[][], unitId: MobilityUnitId): UnitVehicleTypeBreakdown | null {
  const vehicleTypes: UnitVehicleTypeItem[] = []
  let inLandSection = false

  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim()
    const upper = label.toUpperCase()

    if (upper.includes("LAND ASSET")) {
      inLandSection = true
      continue
    }
    if (upper.includes("WATER ASSET")) break
    if (!inLandSection || !label) continue
    if (upper.includes("TYPE")) continue

    vehicleTypes.push({
      vehicleType: label,
      breakdown: readVehicleTypeBreakdown(row),
    })
  }

  const filteredTypes = vehicleTypes.filter(
    (item) => item.vehicleType.toUpperCase() !== "TOTAL" && item.breakdown.total > 0,
  )
  const totalRow = vehicleTypes.find((item) => item.vehicleType.toUpperCase() === "TOTAL")

  if (filteredTypes.length === 0) return null

  const presentation = getMobilityUnitPresentation(unitId)

  return {
    unitId,
    label: presentation.label,
    asOf: parseAsOfFromRows(rows),
    vehicleTypes: filteredTypes,
    landTotal: totalRow?.breakdown.total ?? filteredTypes.reduce((sum, item) => sum + item.breakdown.total, 0),
    waterTotal: 0,
  }
}

function parseCaviteStationRow(row: unknown[]): StationMobilityItem | null {
  const station = String(readMobilityCell(row, 0) ?? "").trim()
  if (!station || station.toUpperCase() === "UNITS/OFFICES") return null

  return {
    station,
    status: readStatus(row, 1),
    total: parseMobilityNumber(readMobilityCell(row, 4)),
    source: {
      organic: parseMobilityNumber(readMobilityCell(row, 6)),
      donated: parseMobilityNumber(readMobilityCell(row, 7)),
      loaned: parseMobilityNumber(readMobilityCell(row, 5)),
    },
  }
}

function parseClearbookStationRow(row: unknown[]): StationMobilityItem | null {
  const station = String(readMobilityCell(row, 0) ?? "").trim()
  if (!station || station.toUpperCase().includes("END-USER") || station.toUpperCase().includes("UNIT/OFFICE")) {
    return null
  }

  return {
    station,
    status: readStatus(row, 1),
    total: parseMobilityNumber(readMobilityCell(row, 4)),
    source: readSource(row, 5),
  }
}

export function parseStationSheet(
  rows: unknown[][],
  unitId: MobilityUnitId,
  sheetName: string,
): UnitStationBreakdown | null {
  const stations: StationMobilityItem[] = []
  const isCaviteFormat = sheetName.toLowerCase().includes("cavite")

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) continue
    const label = String(readMobilityCell(row, 0) ?? "").trim().toUpperCase()
    if (label === "TOTAL" || label === "GRAND TOTAL") break

    const parsed = isCaviteFormat ? parseCaviteStationRow(row) : parseClearbookStationRow(row)
    if (parsed && parsed.total > 0) {
      stations.push(parsed)
    }
  }

  if (stations.length === 0) return null

  const presentation = getMobilityUnitPresentation(unitId)
  return {
    unitId,
    label: presentation.label,
    stations,
  }
}

export function parseMobilityWorkbookSheets(workbook: XLSX.WorkBook) {
  const clearbookRows = sheetRows(workbook, MOBILITY_WORKBOOK_SHEETS.clearbook)
  if (!clearbookRows || clearbookRows.length < 5) {
    throw new Error(`Missing or invalid worksheet "${MOBILITY_WORKBOOK_SHEETS.clearbook}".`)
  }

  const unitVehicleTypes = MOBILITY_UNIT_ORDER.map((unitId) => {
    const sheetName = MOBILITY_UNIT_PPO_SHEETS[unitId]
    const rows = sheetRows(workbook, sheetName)
    return rows ? parseUnitPpoSheet(rows, unitId) : null
  }).filter((item): item is UnitVehicleTypeBreakdown => item !== null)

  const unitStations = MOBILITY_UNIT_ORDER.map((unitId) => {
    const sheetName = MOBILITY_STATION_SHEETS[unitId]
    if (!sheetName) return null
    const rows = sheetRows(workbook, sheetName)
    return rows ? parseStationSheet(rows, unitId, sheetName) : null
  }).filter((item): item is UnitStationBreakdown => item !== null)

  const quicklookRows = sheetRows(workbook, MOBILITY_WORKBOOK_SHEETS.quicklook)
  const classificationRows = sheetRows(workbook, MOBILITY_WORKBOOK_SHEETS.perClassification)
  const wheelRows = sheetRows(workbook, MOBILITY_WORKBOOK_SHEETS.wheelCounts)
  const patrolRows = sheetRows(workbook, MOBILITY_WORKBOOK_SHEETS.patrolRecap)

  return {
    clearbook: parseClearbookSheet(clearbookRows),
    quicklook: quicklookRows ? parseQuicklookSheet(quicklookRows) : null,
    perClassification: classificationRows ? parsePerClassificationSheet(classificationRows) : null,
    wheelCounts: wheelRows ? parseWheelCountSheet(wheelRows) : null,
    patrolRecap: patrolRows ? parsePatrolRecapSheet(patrolRows) : null,
    unitVehicleTypes,
    unitStations,
  }
}
