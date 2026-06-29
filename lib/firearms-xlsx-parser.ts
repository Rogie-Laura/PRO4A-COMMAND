import * as XLSX from "xlsx"

import {
  FIREARMS_SHEET_NAMES,
  FIREARMS_UNIT_ORDER,
  getFirearmsUnitPresentation,
  normalizeFirearmsUnitKey,
  type FirearmsUnitId,
} from "@/lib/firearms-config"
import type {
  FirearmsCategorySummary,
  FirearmsUnitBreakdownItem,
} from "@/lib/firearms-types"

export type ParsedFirearmsWorkbook = {
  shortFirearms: FirearmsCategorySummary
  longFirearms: FirearmsCategorySummary
}

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

function parseUnitRow(row: unknown[]): FirearmsUnitBreakdownItem | null {
  const rawLabel = String(readCell(row, 0) ?? "").trim()
  if (!rawLabel) return null

  const upper = rawLabel.toUpperCase()
  if (upper === "SUB-TOTAL" || upper === "GRAND TOTAL") return null

  const unitId = normalizeFirearmsUnitKey(rawLabel)
  if (!unitId) return null

  const presentation = getFirearmsUnitPresentation(unitId)

  return {
    unitId,
    label: presentation.label,
    shortLabel: presentation.shortLabel,
    logo: presentation.logo,
    colorClass: presentation.colorClass,
    strength: parseOptionalNumber(readCell(row, 1)),
    status: {
      svc: parseNumber(readCell(row, 2)),
      unsvc: parseNumber(readCell(row, 3)),
      ber: parseNumber(readCell(row, 4)),
    },
    total: parseNumber(readCell(row, 5)),
    source: {
      organic: parseNumber(readCell(row, 6)),
      donated: parseNumber(readCell(row, 7)),
      loaned: parseNumber(readCell(row, 8)),
    },
    sourceTotal: parseNumber(readCell(row, 9)),
    fillRate: parseFillRate(readCell(row, 10)),
    isWarehouse: unitId === "ON-STOCK",
  }
}

function parseGrandTotal(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const label = String(readCell(row, 0) ?? "").trim().toUpperCase()
    if (label === "GRAND TOTAL") {
      return parseNumber(readCell(row, 5))
    }
  }

  return 0
}

function parseCategorySheet(
  rows: unknown[][],
  id: "short" | "long",
  label: string,
): FirearmsCategorySummary {
  const parsedUnits = rows
    .slice(2)
    .map((row) => (Array.isArray(row) ? parseUnitRow(row) : null))
    .filter((item): item is FirearmsUnitBreakdownItem => item !== null)

  const byId = new Map(parsedUnits.map((item) => [item.unitId, item]))
  const units = FIREARMS_UNIT_ORDER.map((unitId) => {
    const existing = byId.get(unitId)
    if (existing) return existing

    const presentation = getFirearmsUnitPresentation(unitId)
    return {
      unitId,
      label: presentation.label,
      shortLabel: presentation.shortLabel,
      logo: presentation.logo,
      colorClass: presentation.colorClass,
      strength: null,
      status: { svc: 0, unsvc: 0, ber: 0 },
      total: 0,
      source: { organic: 0, donated: 0, loaned: 0 },
      sourceTotal: 0,
      fillRate: null,
      isWarehouse: unitId === "ON-STOCK",
    }
  })

  const grandTotal = parseGrandTotal(rows) || units.reduce((sum, item) => sum + item.total, 0)

  return {
    id,
    label,
    grandTotal,
    units,
  }
}

function validateSheetHeaders(rows: unknown[][], sheetName: string) {
  const header = rows[0]
  if (!Array.isArray(header)) {
    throw new Error(`Invalid firearms sheet "${sheetName}". Missing header row.`)
  }

  const normalized = header.map((cell) => String(cell ?? "").trim().toUpperCase())
  if (!normalized[0]?.includes("UNIT") || !normalized[1]?.includes("STRENGTH")) {
    throw new Error(
      `Invalid firearms sheet "${sheetName}". Expected UNIT/OFFICE and STRENGTH columns.`,
    )
  }
}

function parseSheet(workbook: XLSX.WorkBook, sheetName: string, id: "short" | "long", label: string) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`Missing worksheet "${sheetName}" in the firearms Excel file.`)
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  if (rows.length < 4) {
    throw new Error(`Worksheet "${sheetName}" has no firearms summary rows.`)
  }

  validateSheetHeaders(rows, sheetName)
  return parseCategorySheet(rows, id, label)
}

export function parseFirearmsXlsx(buffer: ArrayBuffer | Buffer): ParsedFirearmsWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })

  const shortSheet = workbook.SheetNames.find(
    (name) => name.trim().toUpperCase() === FIREARMS_SHEET_NAMES.short,
  )
  const longSheet = workbook.SheetNames.find(
    (name) => name.trim().toUpperCase() === FIREARMS_SHEET_NAMES.long,
  )

  if (!shortSheet || !longSheet) {
    throw new Error(
      'Invalid firearms Excel format. Expected worksheets named "SHORT FIREARMS" and "LONG FIREARMS".',
    )
  }

  return {
    shortFirearms: parseSheet(workbook, shortSheet, "short", "Short Firearms"),
    longFirearms: parseSheet(workbook, longSheet, "long", "Long Firearms"),
  }
}
