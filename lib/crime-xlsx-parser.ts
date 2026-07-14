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
  "datecommitted",
  "timecommitted",
  "offense",
  "column2",
  "modus",
  "casestatus",
] as const

/** PNP-CRAS export (e.g. CRAS-112): Column1 = crime, Column2 = category. */
export const CRIME_CRAS_HEADERS = [
  "ppo",
  "stn",
  "pcp",
  "region",
  "province",
  "municipal",
  "barangay",
  "day",
  "typeofplace",
  "datecommitted",
  "timecommitted",
  "column1",
  "column2",
  "modus",
  "casestatus",
  "lat",
  "lng",
] as const

export const CRIME_CRAS_MIN_YEAR = 2026

export type ParsedCrimeRecord = {
  ppo: string
  stn: string
  pcp: string
  region: string
  province: string
  municipal: string
  barangay: string
  day: string
  year: number | null
  typeofPlace: string
  dateCommitted: string | null
  timeCommitted: string
  crime: string
  category: string
  caseStatus: string
  modus: string
  lat: number | null
  lng: number | null
}

export type ParsedCrimeWorkbook = {
  records: ParsedCrimeRecord[]
  skippedRows: number
  skippedInvalidCategoryRows: number
  skippedFilteredRows: number
}

type CrimeUploadFormat = "legacy" | "incident" | "cras"

function normalizeHeader(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")

  if (normalized === "long") {
    return "lng"
  }

  return normalized
}

function readCell(row: unknown[], index: number | undefined) {
  if (index == null || index < 0) return undefined
  return row[index]
}

function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseExcelDate(value: unknown): string | null {
  if (value == null || value === "") return null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalIsoDate(value)
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
    return formatLocalIsoDate(parsed)
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

function parseCoordinate(value: unknown): number | null {
  if (value == null || value === "") return null

  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const parsed = Number.parseFloat(String(value).trim())
  return Number.isFinite(parsed) ? parsed : null
}

function yearFromIsoDate(isoDate: string | null) {
  if (!isoDate) return null
  const year = Number.parseInt(isoDate.slice(0, 4), 10)
  return Number.isFinite(year) ? year : null
}

function detectUploadFormat(headers: string[]): CrimeUploadFormat {
  const hasCras = CRIME_CRAS_HEADERS.every((header) => headers.includes(header))
  if (hasCras) return "cras"

  const hasLegacy = CRIME_UPLOAD_HEADERS.every((header) => headers.includes(header))
  if (hasLegacy) return "legacy"

  const hasIncident = CRIME_INCIDENT_HEADERS.every((header) => headers.includes(header))
  if (hasIncident) return "incident"

  throw new Error(
    "Invalid crime Excel format. Kailangan ang legacy export (crime, category, YEAR), CIRAS incident export (offense, Column2), o CRAS export (Column1, Column2, pcp, region, lat/lng).",
  )
}

function buildColumnIndex(headers: string[]) {
  return Object.fromEntries(headers.map((header, index) => [header, index])) as Record<
    string,
    number
  >
}

function readOptionalString(row: unknown[], columnIndex: Record<string, number>, key: string) {
  const index = columnIndex[key]
  if (index == null) return ""
  return String(readCell(row, index) ?? "").trim()
}

function parseCrimeRow(
  row: unknown[],
  columnIndex: Record<string, number>,
  format: CrimeUploadFormat,
): ParsedCrimeRecord | "skip" | "invalid-category" | "filtered" {
  const ppo = String(readCell(row, columnIndex.ppo) ?? "").trim()
  const crime =
    format === "cras"
      ? String(readCell(row, columnIndex.column1) ?? "").trim()
      : format === "incident"
        ? String(readCell(row, columnIndex.offense) ?? "").trim()
        : String(readCell(row, columnIndex.crime) ?? "").trim()
  const categoryRaw =
    format === "incident" || format === "cras"
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
  const year = explicitYear ?? yearFromIsoDate(dateCommitted)

  if (format === "cras") {
    if (category !== "INDEX") {
      return "filtered"
    }

    if (!year || year < CRIME_CRAS_MIN_YEAR) {
      return "filtered"
    }
  }

  return {
    ppo,
    stn: String(readCell(row, columnIndex.stn) ?? "").trim(),
    pcp: readOptionalString(row, columnIndex, "pcp"),
    region: readOptionalString(row, columnIndex, "region"),
    province: readOptionalString(row, columnIndex, "province"),
    municipal: readOptionalString(row, columnIndex, "municipal"),
    barangay: String(readCell(row, columnIndex.barangay) ?? "").trim(),
    day: readOptionalString(row, columnIndex, "day"),
    year,
    typeofPlace: String(readCell(row, columnIndex.typeofplace) ?? "").trim(),
    dateCommitted,
    timeCommitted: parseTimeValue(readCell(row, columnIndex.timecommitted)),
    crime,
    category,
    caseStatus: normalizeCaseStatus(String(readCell(row, columnIndex.casestatus) ?? "")),
    modus: String(readCell(row, columnIndex.modus) ?? "").trim(),
    lat: parseCoordinate(readCell(row, columnIndex.lat)),
    lng: parseCoordinate(readCell(row, columnIndex.lng)),
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
  let skippedFilteredRows = 0

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

    if (parsed === "filtered") {
      skippedRows += 1
      skippedFilteredRows += 1
      continue
    }

    records.push(parsed)
  }

  if (records.length === 0) {
    const hint =
      format === "cras"
        ? `Walang valid INDEX crime rows mula ${CRIME_CRAS_MIN_YEAR} pataas.`
        : "Dapat may INDEX o NON INDEX na category ang bawat row."

    throw new Error(`No valid crime records were found in the uploaded file. ${hint}`)
  }

  return { records, skippedRows, skippedInvalidCategoryRows, skippedFilteredRows }
}
