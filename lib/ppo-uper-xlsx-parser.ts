import * as XLSX from "xlsx"

import { formatOrdinalRank } from "@/lib/uper-config"
import type {
  ParsedPpoUperWorkbook,
  PpoUperMonthSnapshot,
  PpoUperRow,
} from "@/lib/ppo-uper-types"

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

const SKIP_SHEET_NAMES = new Set(["computation"])

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function normalizeHeader(value: unknown) {
  return normalizeCell(value).toLowerCase()
}

function parseSheetMonthKey(sheetName: string): { monthKey: string; monthLabel: string } | null {
  const normalized = sheetName.trim().replace(/\s+/g, " ")
  const match = normalized.match(/^([A-Za-z]+)\s+(\d{4})$/)

  if (!match) {
    return null
  }

  const monthName = match[1].toLowerCase()
  const monthIndex = MONTH_NAMES.indexOf(monthName as (typeof MONTH_NAMES)[number])

  if (monthIndex < 0) {
    return null
  }

  const year = match[2]
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${year}`

  return { monthKey, monthLabel }
}

function parsePoints(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 1000) / 1000
  }

  const parsed = Number.parseFloat(normalizeCell(value).replace(/,/g, ""))
  return Number.isFinite(parsed) ? Math.round(parsed * 1000) / 1000 : null
}

function parseDateDesignated(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) {
      const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d))
      return date.toISOString()
    }
  }

  const text = normalizeCell(value)
  if (!text) return ""

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString()
}

function findPpoHeaderRowIndex(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const headers = row.map(normalizeHeader)
    const ppoIndex = headers.indexOf("ppo")
    const rankIndex = headers.indexOf("rank")
    const nameIndex = headers.indexOf("name")
    const dateIndex = headers.findIndex((header) => header.includes("date designated"))
    const kraIndex = headers.findIndex((header) => header.includes("key result areas"))
    const behaviorIndex = headers.findIndex((header) => header.includes("behavior"))
    const complianceIndex = headers.findIndex((header) => header.includes("compliance"))
    const totalIndex = headers.findIndex((header) => header.includes("total points earned"))
    const ratingIndex = headers.findIndex((header) => header.includes("adjectival rating"))

    if (
      ppoIndex >= 0 &&
      rankIndex >= 0 &&
      nameIndex >= 0 &&
      dateIndex >= 0 &&
      kraIndex >= 0 &&
      behaviorIndex >= 0 &&
      complianceIndex >= 0 &&
      totalIndex >= 0 &&
      ratingIndex >= 0
    ) {
      return {
        headerRowIndex: index,
        columnIndex: {
          ppo: ppoIndex,
          rank: rankIndex,
          name: nameIndex,
          dateDesignated: dateIndex,
          kra: kraIndex,
          behavior: behaviorIndex,
          compliance: complianceIndex,
          total: totalIndex,
          rating: ratingIndex,
        },
      }
    }
  }

  return null
}

function parsePpoRow(
  row: unknown[],
  columnIndex: {
    ppo: number
    rank: number
    name: number
    dateDesignated: number
    kra: number
    behavior: number
    compliance: number
    total: number
    rating: number
  },
): Omit<PpoUperRow, "derivedRank" | "derivedRankLabel"> | null {
  const ppo = normalizeCell(row[columnIndex.ppo])
  const rankDesignation = normalizeCell(row[columnIndex.rank])
  const name = normalizeCell(row[columnIndex.name])
  const dateDesignated = parseDateDesignated(row[columnIndex.dateDesignated])
  const kraPoints = parsePoints(row[columnIndex.kra])
  const behaviorPoints = parsePoints(row[columnIndex.behavior])
  const compliancePoints = parsePoints(row[columnIndex.compliance])
  const totalPoints = parsePoints(row[columnIndex.total])
  const rating = normalizeCell(row[columnIndex.rating])

  if (!ppo || !rankDesignation || !name || kraPoints == null || behaviorPoints == null) {
    return null
  }

  if (compliancePoints == null || totalPoints == null || !rating) {
    return null
  }

  return {
    ppo,
    rankDesignation,
    name,
    dateDesignated,
    kraPoints,
    behaviorPoints,
    compliancePoints,
    totalPoints,
    rating,
  }
}

function assignDerivedRanks(
  rows: Omit<PpoUperRow, "derivedRank" | "derivedRankLabel">[],
): PpoUperRow[] {
  const sorted = [...rows].sort((left, right) => {
    if (right.totalPoints !== left.totalPoints) {
      return right.totalPoints - left.totalPoints
    }

    return left.ppo.localeCompare(right.ppo)
  })

  return sorted.map((row, index) => ({
    ...row,
    derivedRank: index + 1,
    derivedRankLabel: formatOrdinalRank(index + 1),
  }))
}

function parseMonthSheet(sheetName: string, rows: unknown[][]): PpoUperMonthSnapshot | null {
  const monthMeta = parseSheetMonthKey(sheetName)
  const header = findPpoHeaderRowIndex(rows)

  if (!monthMeta || !header) {
    return null
  }

  const parsedRows: Omit<PpoUperRow, "derivedRank" | "derivedRankLabel">[] = []

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const firstCell = normalizeCell(row[header.columnIndex.ppo])
    if (!firstCell) continue

    const parsed = parsePpoRow(row, header.columnIndex)
    if (parsed) {
      parsedRows.push(parsed)
    }
  }

  if (parsedRows.length === 0) {
    return null
  }

  return {
    monthKey: monthMeta.monthKey,
    monthLabel: monthMeta.monthLabel,
    rows: assignDerivedRanks(parsedRows),
  }
}

export function parsePpoUperXlsx(buffer: ArrayBuffer | Buffer): ParsedPpoUperWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const months: PpoUperMonthSnapshot[] = []
  const skippedSheets: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const normalizedSheetName = normalizeHeader(sheetName)

    if (SKIP_SHEET_NAMES.has(normalizedSheetName)) {
      skippedSheets.push(sheetName)
      continue
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: true,
    })

    const parsed = parseMonthSheet(sheetName, rows)

    if (!parsed) {
      skippedSheets.push(sheetName)
      continue
    }

    months.push(parsed)
  }

  if (months.length === 0) {
    throw new Error(
      "No valid PPO UPER month sheets were found. Dapat may worksheet bawat buwan (hal. May 2026) na may PPO, Total Points Earned, at Adjectival Rating columns.",
    )
  }

  months.sort((left, right) => left.monthKey.localeCompare(right.monthKey))

  return { months, skippedSheets }
}
