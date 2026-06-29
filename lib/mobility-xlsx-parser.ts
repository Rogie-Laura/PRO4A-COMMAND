import * as XLSX from "xlsx"

import {
  getMobilityUnitPresentation,
  MOBILITY_CLEARBOOK_SHEET_NAME,
  MOBILITY_UNIT_ORDER,
  normalizeMobilityUnitKey,
  type MobilityUnitId,
} from "@/lib/mobility-clearbook-config"
import type { ParsedMobilityClearbook, VehicleUnitBreakdownItem } from "@/lib/mobility-types"

function parseNumber(value: unknown) {
  if (value == null || value === "") return 0
  if (typeof value === "number" && Number.isFinite(value)) return value

  const trimmed = String(value).replace(/,/g, "").trim()
  if (!trimmed) return 0

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseOptionalNumber(value: unknown) {
  if (value == null || value === "") return null

  const parsed = parseNumber(value)
  return parsed === 0 && String(value).trim() === "" ? null : parsed
}

function parseFillRate(value: unknown) {
  if (value == null || value === "") return null

  const parsed = parseNumber(value)
  if (parsed === 0 && String(value).trim() === "") return null

  return parsed <= 1 ? Math.round(parsed * 10000) / 100 : Math.round(parsed * 100) / 100
}

function readCell(row: unknown[], index: number) {
  return row[index]
}

function parseUnitRow(row: unknown[]): VehicleUnitBreakdownItem | null {
  const rawLabel = String(readCell(row, 0) ?? "").trim()
  if (!rawLabel) return null

  const upper = rawLabel.toUpperCase()
  if (upper === "TOTAL" || upper === "SUB-TOTAL" || upper === "GRAND TOTAL") return null

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
    status: {
      svc: parseNumber(readCell(row, 1)),
      unsvc: parseNumber(readCell(row, 2)),
      ber: parseNumber(readCell(row, 3)),
    },
    total: parseNumber(readCell(row, 4)),
    source: {
      organic: parseNumber(readCell(row, 5)),
      donated: parseNumber(readCell(row, 6)),
      loaned: parseNumber(readCell(row, 7)),
    },
    sourceTotal: parseNumber(readCell(row, 8)),
    requiredMobility: parseOptionalNumber(readCell(row, 9)),
    fillRate: parseFillRate(readCell(row, 10)),
    variance: parseOptionalNumber(readCell(row, 11)),
  }
}

function parseGrandTotal(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const label = String(readCell(row, 0) ?? "").trim().toUpperCase()
    if (label === "TOTAL" || label === "GRAND TOTAL") {
      return parseNumber(readCell(row, 4))
    }
  }

  return 0
}

function parseAsOfDate(rows: unknown[][]) {
  for (const row of rows.slice(0, 3)) {
    if (!Array.isArray(row)) continue
    const text = String(readCell(row, 0) ?? "").trim()
    const match = text.match(/AS OF\s+(.+)/i)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return null
}

function validateSheetHeaders(rows: unknown[][], sheetName: string) {
  const header = rows[2]
  if (!Array.isArray(header)) {
    throw new Error(`Invalid clearbook sheet "${sheetName}". Missing header row.`)
  }

  const normalized = header.map((cell) => String(cell ?? "").trim().toUpperCase())
  if (!normalized[0]?.includes("UNIT") || !normalized[1]?.includes("STATUS")) {
    throw new Error(
      `Invalid clearbook sheet "${sheetName}". Expected UNIT/OFFICES and Status columns.`,
    )
  }
}

function parseClearbookSheet(rows: unknown[][]): ParsedMobilityClearbook {
  const dataRows: unknown[][] = []
  for (const row of rows.slice(3)) {
    if (!Array.isArray(row)) continue
    const label = String(readCell(row, 0) ?? "").trim().toUpperCase()
    if (label === "TOTAL" || label === "GRAND TOTAL") {
      break
    }
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

  const grandTotal = parseGrandTotal(rows) || units.reduce((sum, item) => sum + item.total, 0)

  return {
    asOf: parseAsOfDate(rows),
    grandTotal,
    units,
  }
}

export function parseMobilityClearbookXlsx(buffer: ArrayBuffer | Buffer): ParsedMobilityClearbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })

  const clearbookSheet = workbook.SheetNames.find(
    (name) => name.trim().toUpperCase() === MOBILITY_CLEARBOOK_SHEET_NAME,
  )

  if (!clearbookSheet) {
    throw new Error(
      `Invalid mobility Excel format. Expected worksheet named "${MOBILITY_CLEARBOOK_SHEET_NAME}".`,
    )
  }

  const sheet = workbook.Sheets[clearbookSheet]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  if (rows.length < 5) {
    throw new Error(`Worksheet "${clearbookSheet}" has no clearbook summary rows.`)
  }

  validateSheetHeaders(rows, clearbookSheet)
  return parseClearbookSheet(rows)
}
