import type {
  ParsedSurrenderedCtgfWorkbook,
  SurrenderedCtgfCountSet,
  SurrenderedCtgfProvinceRow,
} from "@/lib/surrendered-ctgf-types"
import * as XLSX from "xlsx"

const SECTION_COLUMNS = {
  arrested: { psr: 1, npsr: 2, total: 3 },
  died: { psr: 4, npsr: 5, total: 6 },
  surrendered: { psr: 7, npsr: 8, total: 9 },
  grandTotal: { psr: 10, npsr: 11, total: 12 },
} as const

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

function readCountSet(row: unknown[], columns: { psr: number; npsr: number; total: number }) {
  return {
    psr: parseCount(row[columns.psr]),
    npsr: parseCount(row[columns.npsr]),
    total: parseCount(row[columns.total]),
  }
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const first = normalizeCell(row[0]).toLowerCase()
    if (first !== "province") continue

    const nextRow = rows[index + 1]
    if (!Array.isArray(nextRow)) continue

    const hasSubheaders =
      normalizeCell(nextRow[1]).toLowerCase() === "psr" &&
      normalizeCell(nextRow[2]).toLowerCase() === "npsr" &&
      normalizeCell(nextRow[3]).toLowerCase() === "total"

    if (!hasSubheaders) continue

    return {
      headerRowIndex: index + 1,
      provinceColumn: 0,
    }
  }

  return null
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

function parseRows(rows: unknown[][], header: { headerRowIndex: number; provinceColumn: number }) {
  const parsedRows: SurrenderedCtgfProvinceRow[] = []

  for (let rowIndex = header.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const province = normalizeCell(row[header.provinceColumn])
    if (!province) continue

    if (/^note:/i.test(province)) break

    const isTotal = /^total\b/i.test(province)

    parsedRows.push({
      province,
      arrested: readCountSet(row, SECTION_COLUMNS.arrested),
      died: readCountSet(row, SECTION_COLUMNS.died),
      surrendered: readCountSet(row, SECTION_COLUMNS.surrendered),
      grandTotal: readCountSet(row, SECTION_COLUMNS.grandTotal),
      isTotal,
    })

    if (isTotal) break
  }

  return parsedRows
}

function parseSheet(sheet: XLSX.WorkSheet): ParsedSurrenderedCtgfWorkbook | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) return null

  const parsedRows = parseRows(rows, header)
  if (parsedRows.length === 0) return null

  return {
    title: normalizeCell(rows[0]?.[0]) || "SURRENDERED CTGs and FAs",
    periodLabel: normalizeCell(rows[1]?.[0]),
    note: findNote(rows),
    rows: parsedRows,
  }
}

function resolveSheet(workbook: XLSX.WorkBook) {
  const namedSheet = workbook.Sheets["Sheet1"]
  if (namedSheet) return namedSheet

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    })
    const title = normalizeCell(rows[0]?.[0]).toLowerCase()
    if (title.includes("surrendered ctg")) {
      return sheet
    }
  }

  return workbook.Sheets[workbook.SheetNames[0]]
}

export function parseSurrenderedCtgfXlsx(buffer: ArrayBuffer | Buffer): ParsedSurrenderedCtgfWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })
  const sheet = resolveSheet(workbook)

  if (!sheet) {
    throw new Error("Walang valid sheet sa surrendered CTGs workbook.")
  }

  const parsed = parseSheet(sheet)
  if (!parsed) {
    throw new Error("Walang valid na surrendered CTGs table sa workbook.")
  }

  return parsed
}
