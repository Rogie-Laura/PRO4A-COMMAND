import * as XLSX from "xlsx"

import type {
  ParsedRandomDrugTestWorkbook,
  RandomDrugTestRow,
} from "@/lib/random-drug-test-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  const text = String(value ?? "")
    .replace(/,/g, "")
    .trim()
  if (!text) return 0

  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const headers = row.map((cell) => normalizeCell(cell).toLowerCase())
    const unitIndex = headers.findIndex(
      (header) => header.includes("unit") || header.includes("office"),
    )
    const strengthIndex = headers.findIndex((header) => header.includes("strength"))
    const negativeIndex = headers.findIndex((header) => header.includes("negative"))
    const positiveIndex = headers.findIndex((header) => header.includes("positive"))

    if (unitIndex >= 0 && strengthIndex >= 0 && negativeIndex >= 0 && positiveIndex >= 0) {
      return {
        headerRowIndex: index,
        columnIndex: {
          unit: unitIndex,
          totalStrength: strengthIndex,
          negative: negativeIndex,
          positive: positiveIndex,
        },
      }
    }
  }

  return null
}

function findTitle(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const text = normalizeCell(row[0])
    if (/drug test/i.test(text) || /personnel who underwent/i.test(text)) {
      return text
    }
  }
  return "Random Drug Test"
}

function findPeriodLabel(rows: unknown[][], headerRowIndex: number) {
  for (let index = 0; index < headerRowIndex; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue
    const text = normalizeCell(row[0])
    if (!text) continue
    if (/to|january|february|march|april|may|june|july|august|september|october|november|december|\d{4}/i.test(text)) {
      if (/drug test|personnel who underwent/i.test(text)) continue
      return text
    }
  }
  return ""
}

function findNote(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    for (const cell of row) {
      const text = normalizeCell(cell)
      if (/^note:/i.test(text)) return text
    }
  }
  return ""
}

export function parseRandomDrugTestXlsx(
  buffer: ArrayBuffer | Buffer,
): ParsedRandomDrugTestWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined

  if (!sheet) {
    throw new Error("Walang sheet sa Random Drug Test workbook.")
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) {
    throw new Error(
      "Hindi mahanap ang Random Drug Test table. Dapat may UNIT/OFFICE, TOTAL STRENGTH, Negative, at Positive columns.",
    )
  }

  const parsedRows: RandomDrugTestRow[] = []

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const unit = normalizeCell(row[header.columnIndex.unit])
    if (!unit || /^note:/i.test(unit)) break

    const totalStrength = parseCount(row[header.columnIndex.totalStrength])
    const negative = parseCount(row[header.columnIndex.negative])
    const positive = parseCount(row[header.columnIndex.positive])

    if (totalStrength === 0 && negative === 0 && positive === 0) continue

    parsedRows.push({
      unit,
      totalStrength,
      negative,
      positive,
      isTotal: /grand\s*total|^total$/i.test(unit),
    })
  }

  if (parsedRows.length === 0) {
    throw new Error("Walang valid na Random Drug Test rows sa workbook.")
  }

  return {
    title: findTitle(rows),
    periodLabel: findPeriodLabel(rows, header.headerRowIndex),
    note: findNote(rows),
    rows: parsedRows,
  }
}
