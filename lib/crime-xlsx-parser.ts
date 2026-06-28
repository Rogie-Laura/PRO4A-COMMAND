import * as XLSX from "xlsx"

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
}

export type ParsedCrimeWorkbook = {
  records: ParsedCrimeRecord[]
  skippedRows: number
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
}

function readCell(row: unknown[], index: number) {
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

function validateHeaders(headers: string[]) {
  const normalized = headers.map(normalizeHeader)
  const missing = CRIME_UPLOAD_HEADERS.filter((header) => !normalized.includes(header))

  if (missing.length > 0) {
    throw new Error(
      `Invalid crime Excel format. Missing columns: ${missing.join(", ")}. Kailangan: ppo, stn, barangay, YEAR, typeofPlace, dateReported, dateCommitted, timeCommitted, crime.`,
    )
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
  validateHeaders(headers)

  const columnIndex = Object.fromEntries(headers.map((header, index) => [header, index]))
  const records: ParsedCrimeRecord[] = []
  let skippedRows = 0

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) {
      skippedRows += 1
      continue
    }

    const ppo = String(readCell(row, columnIndex.ppo) ?? "").trim()
    const crime = String(readCell(row, columnIndex.crime) ?? "").trim()

    if (!ppo || !crime) {
      skippedRows += 1
      continue
    }

    records.push({
      ppo,
      stn: String(readCell(row, columnIndex.stn) ?? "").trim(),
      barangay: String(readCell(row, columnIndex.barangay) ?? "").trim(),
      year: parseYear(readCell(row, columnIndex.year)),
      typeofPlace: String(readCell(row, columnIndex.typeofplace) ?? "").trim(),
      dateReported: parseExcelDate(readCell(row, columnIndex.datereported)),
      dateCommitted: parseExcelDate(readCell(row, columnIndex.datecommitted)),
      timeCommitted: parseTimeValue(readCell(row, columnIndex.timecommitted)),
      crime,
    })
  }

  if (records.length === 0) {
    throw new Error("No valid crime records were found in the uploaded file.")
  }

  return { records, skippedRows }
}
