import * as XLSX from "xlsx"

import {
  getBmiCategoryFromLabel,
  getBmiCategoryFromValue,
  type BmiCategoryId,
} from "@/lib/bmi-config"
import { NUP_RANK, PCO_RANK_ORDER, PNCO_RANK_ORDER } from "@/lib/rank-config"

const ALL_RANKS = [...PCO_RANK_ORDER, ...PNCO_RANK_ORDER, NUP_RANK].sort(
  (left, right) => right.length - left.length,
)

const EXPECTED_HEADERS = [
  "rank fullname",
  "subunitdesc",
  "assignment",
  "bmi class",
  "age",
  "height",
  "weight",
  "waist",
  "hip",
  "wrist",
  "bmi result",
  "encoded by",
  "date taken",
] as const

export type ParsedBmiRecord = {
  rankFullname: string
  rank: string
  fullName: string
  subUnit: string
  assignment: string
  bmiClass: string
  bmiCategoryId: BmiCategoryId | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
  waistCm: number | null
  hipCm: number | null
  wristCm: number | null
  bmiResult: number | null
  encodedBy: string
  dateTaken: string | null
}

export type ParsedBmiWorkbook = {
  records: ParsedBmiRecord[]
  skippedRows: number
  categoryPreview: Partial<Record<BmiCategoryId, number>>
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

function parseNumber(value: unknown) {
  if (value == null || value === "") return null

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  const trimmed = String(value).replace(/,/g, "").trim()
  if (!trimmed || trimmed.startsWith("#")) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function parseInteger(value: unknown) {
  const parsed = parseNumber(value)
  if (parsed == null) return null
  return Math.round(parsed)
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
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

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

export function parseRankFullname(value: string) {
  const trimmed = value.trim()

  for (const rank of ALL_RANKS) {
    if (trimmed.startsWith(`${rank} `)) {
      return {
        rank,
        fullName: trimmed.slice(rank.length + 1).trim(),
      }
    }
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) {
    return { rank: parts[0] ?? "", fullName: "" }
  }

  return {
    rank: parts[0] ?? "",
    fullName: parts.slice(1).join(" "),
  }
}

function resolveCategory(bmiClass: string, bmiResult: number | null): BmiCategoryId | null {
  const fromLabel = getBmiCategoryFromLabel(bmiClass)
  if (fromLabel) return fromLabel

  if (bmiResult !== null) {
    return getBmiCategoryFromValue(bmiResult)
  }

  return null
}

function readCell(row: unknown[], index: number) {
  return row[index]
}

function validateHeaders(headers: string[]) {
  const normalized = headers.map(normalizeHeader)
  const missing = EXPECTED_HEADERS.filter((header) => !normalized.includes(header))

  if (missing.length > 0) {
    throw new Error(
      `Invalid BMI Excel format. Missing columns: ${missing.join(", ")}. Use the sample "With BMI List.xlsx" template.`,
    )
  }
}

export function parseBmiXlsx(buffer: ArrayBuffer | Buffer): ParsedBmiWorkbook {
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
    throw new Error("The Excel file has no BMI records.")
  }

  const headerRow = rows[0] ?? []
  const headers = headerRow.map((cell) => normalizeHeader(cell))
  validateHeaders(headers)

  const columnIndex = Object.fromEntries(headers.map((header, index) => [header, index]))
  const records: ParsedBmiRecord[] = []
  const categoryPreview: Partial<Record<BmiCategoryId, number>> = {}
  let skippedRows = 0

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) {
      skippedRows += 1
      continue
    }

    const rankFullname = String(readCell(row, columnIndex["rank fullname"]) ?? "").trim()
    if (!rankFullname) {
      skippedRows += 1
      continue
    }

    const bmiClass = String(readCell(row, columnIndex["bmi class"]) ?? "").trim()
    const bmiResult = parseNumber(readCell(row, columnIndex["bmi result"]))
    const bmiCategoryId = resolveCategory(bmiClass, bmiResult)

    if (!bmiCategoryId) {
      skippedRows += 1
      continue
    }

    const { rank, fullName } = parseRankFullname(rankFullname)
    const record: ParsedBmiRecord = {
      rankFullname,
      rank,
      fullName,
      subUnit: String(readCell(row, columnIndex.subunitdesc) ?? "").trim(),
      assignment: String(readCell(row, columnIndex.assignment) ?? "").trim(),
      bmiClass,
      bmiCategoryId,
      age: parseInteger(readCell(row, columnIndex.age)),
      heightCm: parseNumber(readCell(row, columnIndex.height)),
      weightKg: parseNumber(readCell(row, columnIndex.weight)),
      waistCm: parseNumber(readCell(row, columnIndex.waist)),
      hipCm: parseNumber(readCell(row, columnIndex.hip)),
      wristCm: parseNumber(readCell(row, columnIndex.wrist)),
      bmiResult,
      encodedBy: String(readCell(row, columnIndex["encoded by"]) ?? "").trim(),
      dateTaken: parseExcelDate(readCell(row, columnIndex["date taken"])),
    }

    records.push(record)
    categoryPreview[bmiCategoryId] = (categoryPreview[bmiCategoryId] ?? 0) + 1
  }

  if (records.length === 0) {
    throw new Error("No valid BMI records were found in the uploaded file.")
  }

  return {
    records,
    skippedRows,
    categoryPreview,
  }
}
