import * as XLSX from "xlsx"

import type {
  IntelEligibilityStrength,
  IntelEligibilityUnitRow,
  ParsedIntelEligibilityWorkbook,
} from "@/lib/intel-eligibility-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value))
  }

  const text = normalizeCell(value).replace(/,/g, "")
  if (!text) return 0

  const parsed = Number(text)
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

function readStrength(row: unknown[], startColumn: number): IntelEligibilityStrength {
  const pco = parseCount(row[startColumn])
  const pnco = parseCount(row[startColumn + 1])
  const nup = parseCount(row[startColumn + 2])
  const totalCell = parseCount(row[startColumn + 3])
  const total = totalCell > 0 ? totalCell : pco + pnco + nup

  return { pco, pnco, nup, total }
}

function findOfficeHeader(rows: unknown[][]) {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 40); rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    for (let column = 0; column < row.length; column += 1) {
      const value = normalizeCell(row[column]).toLowerCase()
      if (value === "office/unit" || value === "office / unit") {
        return { headerRowIndex: rowIndex, officeColumn: column }
      }
    }
  }

  return null
}

function findTitleAndPeriod(rows: unknown[][], headerRowIndex: number) {
  let title = "Intelligence Eligibility List"
  let periodLabel = ""

  for (let rowIndex = 0; rowIndex < headerRowIndex; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    for (const cell of row) {
      const text = normalizeCell(cell)
      if (!text) continue

      const lower = text.toLowerCase()
      if (lower.includes("intelligence") && lower.includes("eligib")) {
        title = text.replace(/\s+/g, " ").trim()
        continue
      }

      if (/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}$/i.test(text)) {
        periodLabel = text
      }
    }
  }

  return { title, periodLabel }
}

function findNote(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    for (const cell of row) {
      const text = normalizeCell(cell)
      if (text.toLowerCase().startsWith("note:")) {
        return text
      }
    }
  }

  return ""
}

function isTotalUnit(unit: string) {
  return /^total$/i.test(unit)
}

function hasAnyStrength(row: IntelEligibilityUnitRow) {
  return (
    row.authorized.total > 0 ||
    row.actual.total > 0 ||
    row.withTraining.total > 0 ||
    row.withSeminar.total > 0 ||
    row.withoutTrainingSeminar.total > 0 ||
    row.trainingNotInPosition.total > 0
  )
}

export function parseIntelEligibilityXlsx(
  buffer: ArrayBuffer | Buffer,
): ParsedIntelEligibilityWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheetName =
    workbook.SheetNames.find((name) => name.trim().toUpperCase() === "IEL") ??
    workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error("Walang sheet sa Intelligence Eligibility workbook.")
  }

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`Hindi mabasa ang "${sheetName}" sheet.`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
    blankrows: false,
  }) as unknown[][]

  const header = findOfficeHeader(rows)
  if (!header) {
    throw new Error('Walang "OFFICE/UNIT" header sa IEL sheet.')
  }

  const { title, periodLabel } = findTitleAndPeriod(rows, header.headerRowIndex)
  const note = findNote(rows)
  const officeColumn = header.officeColumn

  // Skip category header + subheader rows (PCO/PNCO/NUP/TOTAL and training notes)
  const dataStart = header.headerRowIndex + 1
  const units: IntelEligibilityUnitRow[] = []

  for (let rowIndex = dataStart; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const unit = normalizeCell(row[officeColumn])
    if (!unit) continue
    if (unit.toLowerCase().startsWith("note:")) continue

    // Skip pure subheader rows under TRAINING columns
    const lower = unit.toLowerCase()
    if (lower.includes("ibc for pco") || lower.includes("pic/ibc")) continue

    const mapped: IntelEligibilityUnitRow = {
      unit,
      authorized: readStrength(row, officeColumn + 1),
      actual: readStrength(row, officeColumn + 5),
      withTraining: readStrength(row, officeColumn + 9),
      withSeminar: readStrength(row, officeColumn + 13),
      withoutTrainingSeminar: readStrength(row, officeColumn + 17),
      trainingNotInPosition: readStrength(row, officeColumn + 21),
      isTotal: isTotalUnit(unit),
    }

    // Skip blank spacer / legend rows that somehow have a unit-like label
    if (!mapped.isTotal && !hasAnyStrength(mapped) && mapped.authorized.total === 0) {
      continue
    }

    // Skip header-ish rows where all numbers are 0 and unit looks like a column label
    if (/^(pco|pnco|nup|total)$/i.test(unit)) {
      continue
    }

    units.push(mapped)
  }

  if (units.length === 0) {
    throw new Error("Walang valid na OFFICE/UNIT rows sa Intelligence Eligibility List.")
  }

  if (!units.some((row) => !row.isTotal)) {
    throw new Error("Walang unit rows (bukod sa TOTAL) sa IEL sheet.")
  }

  return {
    title,
    periodLabel,
    note,
    units,
  }
}
