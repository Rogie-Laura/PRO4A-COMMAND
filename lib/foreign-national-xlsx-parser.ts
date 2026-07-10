import type {
  ForeignNationalMonth,
  ForeignNationalMonthlyCounts,
  ForeignNationalPpoRow,
  ParsedForeignNationalWorkbook,
} from "@/lib/foreign-national-types"
import { FOREIGN_NATIONAL_MONTHS } from "@/lib/foreign-national-types"
import * as XLSX from "xlsx"

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

function normalizeMonthLabel(value: unknown): ForeignNationalMonth | null {
  const text = normalizeCell(value).toUpperCase()
  if (!text) return null

  const month = FOREIGN_NATIONAL_MONTHS.find((label) => label === text)
  return month ?? null
}

function emptyMonthlyCounts(): ForeignNationalMonthlyCounts {
  return Object.fromEntries(
    FOREIGN_NATIONAL_MONTHS.map((month) => [month, 0]),
  ) as ForeignNationalMonthlyCounts
}

function sumMonthlyCounts(months: ForeignNationalMonthlyCounts) {
  return FOREIGN_NATIONAL_MONTHS.reduce((total, month) => total + months[month], 0)
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const first = normalizeCell(row[0]).toUpperCase()
    if (first !== "PPO") continue

    const monthColumns: Partial<Record<ForeignNationalMonth, number>> = {}
    for (let columnIndex = 1; columnIndex < row.length; columnIndex += 1) {
      const month = normalizeMonthLabel(row[columnIndex])
      if (month) {
        monthColumns[month] = columnIndex
      }
    }

    const foundMonths = FOREIGN_NATIONAL_MONTHS.filter((month) => monthColumns[month] !== undefined)
    if (foundMonths.length < 6) continue

    return {
      headerRowIndex: index,
      monthColumns: monthColumns as Record<ForeignNationalMonth, number>,
      months: foundMonths,
    }
  }

  return null
}

function readMonthlyCounts(
  row: unknown[],
  monthColumns: Record<ForeignNationalMonth, number>,
): ForeignNationalMonthlyCounts {
  const months = emptyMonthlyCounts()

  for (const month of FOREIGN_NATIONAL_MONTHS) {
    const columnIndex = monthColumns[month]
    if (columnIndex === undefined) continue
    months[month] = parseCount(row[columnIndex])
  }

  return months
}

function findNote(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue

    for (const cell of row) {
      const text = normalizeCell(cell)
      if (/^note:/i.test(text)) {
        return text
      }
    }
  }

  return ""
}

function findGrandTotal(rows: unknown[][], startIndex: number) {
  for (let rowIndex = startIndex; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const label = normalizeCell(row[0]).toUpperCase()
    if (!/^TOTAL\b/.test(label)) continue

    for (let columnIndex = 1; columnIndex < row.length; columnIndex += 1) {
      const value = parseCount(row[columnIndex])
      if (value > 0) {
        return value
      }
    }
  }

  return 0
}

function parseRows(
  rows: unknown[][],
  header: {
    headerRowIndex: number
    monthColumns: Record<ForeignNationalMonth, number>
  },
) {
  const parsedRows: ForeignNationalPpoRow[] = []

  for (let rowIndex = header.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const ppo = normalizeCell(row[0])
    if (!ppo) continue

    if (/^note:/i.test(ppo)) break

    const upper = ppo.toUpperCase()
    if (/^TOTAL\b/.test(upper)) break

    const isSubTotal = /^SUB\s*TOTAL\b/i.test(ppo)
    const months = readMonthlyCounts(row, header.monthColumns)

    parsedRows.push({
      ppo,
      months,
      rowTotal: sumMonthlyCounts(months),
      isSubTotal,
    })
  }

  return parsedRows
}

function parseSheet(sheet: XLSX.WorkSheet): ParsedForeignNationalWorkbook | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) return null

  const parsedRows = parseRows(rows, header)
  if (parsedRows.length === 0) return null

  const subTotalRow = parsedRows.find((row) => row.isSubTotal)
  const grandTotal =
    findGrandTotal(rows, header.headerRowIndex + 1) || subTotalRow?.rowTotal || 0

  return {
    title: normalizeCell(rows[0]?.[0]) || "Incident Report Involving Foreign National",
    note: findNote(rows),
    months: header.months,
    rows: parsedRows,
    grandTotal,
  }
}

function resolveSheet(workbook: XLSX.WorkBook) {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    })
    const title = normalizeCell(rows[0]?.[0]).toLowerCase()
    if (title.includes("foreign national") || title.includes("incident report")) {
      return sheet
    }
  }

  return workbook.Sheets[workbook.SheetNames[0]]
}

export function parseForeignNationalXlsx(
  buffer: ArrayBuffer | Buffer,
): ParsedForeignNationalWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })
  const sheet = resolveSheet(workbook)

  if (!sheet) {
    throw new Error("Walang valid sheet sa foreign national workbook.")
  }

  const parsed = parseSheet(sheet)
  if (!parsed) {
    throw new Error("Walang valid na foreign national table sa workbook.")
  }

  return parsed
}
