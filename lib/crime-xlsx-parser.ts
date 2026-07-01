import * as XLSX from "xlsx"

import {
  normalizeCaseStatus,
  normalizeUploadCategory,
} from "@/lib/crime-config"

export const CRIME_UPLOAD_HEADERS = [
  "ppo",
  "stn",
  "barangay",
  "year",
  "typeofplace",
  "datereported",
  "datecommitted",
  "timecommitted",
  "crime",
  "category",
  "casestatus",
] as const

export const CRIME_INCIDENT_HEADERS = [
  "ppo",
  "stn",
  "barangay",
  "typeofplace",
  "datereported",
  "datecommitted",
  "timecommitted",
  "offense",
  "column2",
  "modus",
  "casestatus",
] as const

export type ParsedCrimeRecord = {
  ppo: string
  stn: string
  barangay: string
  year: number | null
  typeofPlace: string
  dateReported: string | null
  dateCommitted: string | null
  timeCommitted: string
  crime: string
  category: string
  caseStatus: string
  modus: string
}

export type ParsedCrimeWorkbook = {
  records: ParsedCrimeRecord[]
  skippedRows: number
  skippedInvalidCategoryRows: number
}

type CrimeUploadFormat = "legacy" | "incident"

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
}

function readCell(row: unknown[], index: number | undefined) {
  if (index == null || index < 0) return undefined
  return row[index]
}

function parseExcelDate(value: unknown): string | null {
  if (value == null || value === "") return null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null

    const month = String(parsed.m).padStart(2, "0")
    const day = String(parsed.d).padStart(2, "0")
    return `${parsed.y}-${month}-${day}`
  }

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slashMatch) {
    const month = slashMatch[1].padStart(2, "0")
    const day = slashMatch[2].padStart(2, "0")
    const year =
      slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3].padStart(4, "0")
    return `${year}-${month}-${day}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return null
}

function parseTimeValue(value: unknown) {
  if (value == null || value === "") return ""

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toTimeString().slice(0, 8)
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return String(value)

    const hours = String(parsed.H).padStart(2, "0")
    const minutes = String(parsed.M).padStart(2, "0")
    const seconds = String(parsed.S).padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }

  return String(value).trim()
}

function parseYear(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  const parsed = Number.parseInt(String(value ?? "").trim(), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function yearFromIsoDate(isoDate: string | null) {
  if (!isoDate) return null
  const year = Number.parseInt(isoDate.slice(0, 4), 10)
  return Number.isFinite(year) ? year : null
}

function detectUploadFormat(headers: string[]): CrimeUploadFormat {
  const hasLegacy = CRIME_UPLOAD_HEADERS.every((header) => headers.includes(header))
  if (hasLegacy) return "legacy"

  const hasIncident = CRIME_INCIDENT_HEADERS.every((header) => headers.includes(header))
  if (hasIncident) return "incident"

  throw new Error(
    "Invalid crime Excel format. Kailangan ang legacy export (crime, category, YEAR) o ang CIRAS incident export (offense, Column2, modus, casestatus).",
  )
}

function buildColumnIndex(headers: string[]) {
  return Object.fromEntries(headers.map((header, index) => [header, index])) as Record<
    string,
    number
  >
}

function parseCrimeRow(
  row: unknown[],
  columnIndex: Record<string, number>,
  format: CrimeUploadFormat,
): ParsedCrimeRecord | "skip" | "invalid-category" {
  const ppo = String(readCell(row, columnIndex.ppo) ?? "").trim()
  const crime =
    format === "incident"
      ? String(readCell(row, columnIndex.offense) ?? "").trim()
      : String(readCell(row, columnIndex.crime) ?? "").trim()
  const categoryRaw =
    format === "incident"
      ? String(readCell(row, columnIndex.column2) ?? "")
      : String(readCell(row, columnIndex.category) ?? "")
  const category = normalizeUploadCategory(categoryRaw)

  if (!ppo || !crime) {
    return "skip"
  }

  if (!category) {
    return "invalid-category"
  }

  const dateCommitted = parseExcelDate(readCell(row, columnIndex.datecommitted))
  const explicitYear =
    format === "legacy" ? parseYear(readCell(row, columnIndex.year)) : null

  return {
    ppo,
    stn: String(readCell(row, columnIndex.stn) ?? "").trim(),
    barangay: String(readCell(row, columnIndex.barangay) ?? "").trim(),
    year: explicitYear ?? yearFromIsoDate(dateCommitted),
    typeofPlace: String(readCell(row, columnIndex.typeofplace) ?? "").trim(),
    dateReported: parseExcelDate(readCell(row, columnIndex.datereported)),
    dateCommitted,
    timeCommitted: parseTimeValue(readCell(row, columnIndex.timecommitted)),
    crime,
    category,
    caseStatus: normalizeCaseStatus(String(readCell(row, columnIndex.casestatus) ?? "")),
    modus:
      format === "incident"
        ? String(readCell(row, columnIndex.modus) ?? "").trim()
        : String(readCell(row, columnIndex.modus) ?? "").trim(),
  }
}

export function parseCrimeXlsx(buffer: ArrayBuffer | Buffer): ParsedCrimeWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error("The Excel file has no worksheets.")
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: true,
  })

  if (rows.length < 2) {
    throw new Error("The Excel file has no crime records.")
  }

  const headerRow = rows[0] ?? []
  const headers = headerRow.map((cell) => normalizeHeader(cell))
  const format = detectUploadFormat(headers)
  const columnIndex = buildColumnIndex(headers)

  const records: ParsedCrimeRecord[] = []
  let skippedRows = 0
  let skippedInvalidCategoryRows = 0

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) {
      skippedRows += 1
      continue
    }

    const parsed = parseCrimeRow(row, columnIndex, format)
    if (parsed === "skip") {
      skippedRows += 1
      continue
    }

    if (parsed === "invalid-category") {
      skippedRows += 1
      skippedInvalidCategoryRows += 1
      continue
    }

    records.push(parsed)
  }

  if (records.length === 0) {
    throw new Error(
      "No valid crime records were found in the uploaded file. Dapat may INDEX o NON INDEX na category ang bawat row.",
    )
  }

  return { records, skippedRows, skippedInvalidCategoryRows }
}
