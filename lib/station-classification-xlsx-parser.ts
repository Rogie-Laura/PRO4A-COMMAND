import * as XLSX from "xlsx"

import { STATION_CLASSIFICATION_TYPES } from "@/lib/station-classification-types"
import type {
  ParsedStationClassificationWorkbook,
  StationClassificationGroup,
  StationClassificationPpoRow,
  StationClassificationTotals,
  StationClassificationTypeId,
  StationClassificationUnit,
} from "@/lib/station-classification-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function normalizeHeader(value: unknown) {
  return normalizeCell(value).toLowerCase()
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  const parsed = Number.parseInt(normalizeCell(value), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function findSummaryHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const headers = row.map(normalizeHeader)
    const ppoIndex = headers.indexOf("ppo")
    const ccpsIndex = headers.indexOf("ccps")
    const mpsAIndex = headers.findIndex((header) => header === "mps a")
    const mpsBIndex = headers.findIndex((header) => header === "mps b")
    const mpsCIndex = headers.findIndex((header) => header === "mps c")

    if (ppoIndex >= 0 && ccpsIndex >= 0 && mpsAIndex >= 0 && mpsBIndex >= 0 && mpsCIndex >= 0) {
      return {
        headerRowIndex: index,
        columnIndex: {
          ppo: ppoIndex,
          ccps: ccpsIndex,
          mpsA: mpsAIndex,
          mpsB: mpsBIndex,
          mpsC: mpsCIndex,
        },
      }
    }
  }

  return null
}

function parsePpoRows(rows: unknown[][], header: NonNullable<ReturnType<typeof findSummaryHeaderRow>>) {
  const ppoRows: StationClassificationPpoRow[] = []

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const ppo = normalizeCell(row[header.columnIndex.ppo])
    if (!ppo || /^grand total$/i.test(ppo) || /^recap/i.test(ppo)) {
      break
    }

    const ccps = parseCount(row[header.columnIndex.ccps])
    const mpsA = parseCount(row[header.columnIndex.mpsA])
    const mpsB = parseCount(row[header.columnIndex.mpsB])
    const mpsC = parseCount(row[header.columnIndex.mpsC])

    if (ccps == null || mpsA == null || mpsB == null || mpsC == null) {
      continue
    }

    ppoRows.push({ ppo, ccps, mpsA, mpsB, mpsC })
  }

  return ppoRows
}

function parseGrandTotalRow(rows: unknown[][], header: NonNullable<ReturnType<typeof findSummaryHeaderRow>>) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue

    const label = normalizeCell(row[header.columnIndex.ppo]).toLowerCase()
    if (label !== "grand total") continue

    const ccps = parseCount(row[header.columnIndex.ccps])
    const mpsA = parseCount(row[header.columnIndex.mpsA])
    const mpsB = parseCount(row[header.columnIndex.mpsB])
    const mpsC = parseCount(row[header.columnIndex.mpsC])

    if (ccps == null || mpsA == null || mpsB == null || mpsC == null) {
      return null
    }

    return { ccps, mpsA, mpsB, mpsC }
  }

  return null
}

function parseRecapTotals(rows: unknown[][]) {
  let ccps: number | null = null
  let mpsA: number | null = null
  let mpsB: number | null = null
  let mpsC: number | null = null
  let stations: number | null = null
  let pmfc: number | null = null

  for (const row of rows) {
    if (!Array.isArray(row)) continue

    const label = normalizeCell(row[0]).toLowerCase()
    const count = parseCount(row[1])

    if (count == null) continue

    if (label === "ccps") ccps = count
    if (label === "mps a") mpsA = count
    if (label === "mps b") mpsB = count
    if (label === "mps c") mpsC = count
    if (label === "total") stations = count
    if (label === "pmfc") pmfc = count
  }

  if (ccps == null || mpsA == null || mpsB == null || mpsC == null || stations == null || pmfc == null) {
    return null
  }

  return { ccps, mpsA, mpsB, mpsC, stations, pmfc }
}

function parseUnitListSheet(rows: unknown[][]): StationClassificationUnit[] {
  const units: StationClassificationUnit[] = []

  for (const row of rows) {
    if (!Array.isArray(row)) continue

    const number = parseCount(row[0])
    const name = normalizeCell(row[1])

    if (number == null || !name) continue
    if (/^no\.?$/i.test(String(row[0])) || /^unit$/i.test(name)) continue

    units.push({ number, name })
  }

  return units
}

function parseClassificationGroup(
  workbook: XLSX.WorkBook,
  typeId: StationClassificationTypeId,
  label: string,
  sheetName: string,
): StationClassificationGroup | null {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return null

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const units = parseUnitListSheet(rows)
  if (units.length === 0) return null

  return { id: typeId, label, units }
}

function parseSummarySheet(rows: unknown[][]) {
  const asOfLabel = normalizeCell(rows[0]?.[0]) || "Station Classification"
  const header = findSummaryHeaderRow(rows)

  if (!header) {
    throw new Error("Hindi mahanap ang PPO summary table sa Station Classification sheet.")
  }

  const ppoRows = parsePpoRows(rows, header)
  const grandTotal = parseGrandTotalRow(rows, header)
  const recapTotals = parseRecapTotals(rows)

  if (ppoRows.length === 0) {
    throw new Error("Walang PPO rows sa Station Classification sheet.")
  }

  const totals: StationClassificationTotals = recapTotals ?? {
    ccps: grandTotal?.ccps ?? ppoRows.reduce((sum, row) => sum + row.ccps, 0),
    mpsA: grandTotal?.mpsA ?? ppoRows.reduce((sum, row) => sum + row.mpsA, 0),
    mpsB: grandTotal?.mpsB ?? ppoRows.reduce((sum, row) => sum + row.mpsB, 0),
    mpsC: grandTotal?.mpsC ?? ppoRows.reduce((sum, row) => sum + row.mpsC, 0),
    stations:
      (grandTotal?.ccps ?? 0) +
      (grandTotal?.mpsA ?? 0) +
      (grandTotal?.mpsB ?? 0) +
      (grandTotal?.mpsC ?? 0),
    pmfc: 0,
  }

  if (recapTotals) {
    totals.pmfc = recapTotals.pmfc
    totals.stations = recapTotals.stations
  }

  return { asOfLabel, ppoRows, totals }
}

export function parseStationClassificationXlsx(buffer: ArrayBuffer | Buffer): ParsedStationClassificationWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const summarySheet = workbook.Sheets["Station Classification"]

  if (!summarySheet) {
    throw new Error('Walang "Station Classification" sheet sa workbook.')
  }

  const summaryRows = XLSX.utils.sheet_to_json<unknown[]>(summarySheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const summary = parseSummarySheet(summaryRows)
  const groups: StationClassificationGroup[] = []
  const skippedSheets: string[] = []

  for (const type of STATION_CLASSIFICATION_TYPES) {
    const group = parseClassificationGroup(workbook, type.id, type.label, type.sheetName)

    if (!group) {
      skippedSheets.push(type.sheetName)
      continue
    }

    groups.push(group)
  }

  const pmfcSheet = workbook.Sheets.PMFC
  const pmfcUnits = pmfcSheet
    ? parseUnitListSheet(
        XLSX.utils.sheet_to_json<unknown[]>(pmfcSheet, {
          header: 1,
          defval: "",
          raw: true,
        }),
      )
    : []

  if (pmfcUnits.length > 0) {
    summary.totals.pmfc = pmfcUnits.length
  }

  if (groups.length === 0) {
    throw new Error("Walang valid na classification unit sheets (CCPS, Class A, Class B, Class C).")
  }

  return {
    asOfLabel: summary.asOfLabel,
    ppoRows: summary.ppoRows,
    totals: summary.totals,
    groups,
    pmfcUnits,
    skippedSheets,
  }
}
