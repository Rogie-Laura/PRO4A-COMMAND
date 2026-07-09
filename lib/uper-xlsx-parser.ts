import * as XLSX from "xlsx"

import type { ParsedUperWorkbook, UperMonthSnapshot, UperRankingRow } from "@/lib/uper-types"

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

function parseRankNumber(value: unknown) {
  const match = normalizeCell(value).match(/^(\d+)/)
  if (!match) return null

  const rankNumber = Number.parseInt(match[1], 10)
  return Number.isFinite(rankNumber) ? rankNumber : null
}

function parsePoints(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100
  }

  const parsed = Number.parseFloat(normalizeCell(value).replace(/,/g, ""))
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null
}

function findHeaderRowIndex(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const headers = row.map(normalizeHeader)
    const officeIndex = headers.indexOf("office")
    const pointsIndex = headers.findIndex((header) => header.includes("total earned points"))
    const ratingIndex = headers.findIndex((header) => header.includes("adjectival rating"))
    const rankingIndex = headers.indexOf("ranking")

    if (officeIndex >= 0 && pointsIndex >= 0 && ratingIndex >= 0 && rankingIndex >= 0) {
      return {
        headerRowIndex: index,
        columnIndex: {
          office: officeIndex,
          points: pointsIndex,
          rating: ratingIndex,
          ranking: rankingIndex,
        },
      }
    }
  }

  return null
}

function parseRankingRow(
  row: unknown[],
  columnIndex: { office: number; points: number; rating: number; ranking: number },
): UperRankingRow | null {
  const office = normalizeCell(row[columnIndex.office])
  const points = parsePoints(row[columnIndex.points])
  const rating = normalizeCell(row[columnIndex.rating]).toUpperCase()
  const rankLabel = normalizeCell(row[columnIndex.ranking])
  const rankNumber = parseRankNumber(rankLabel)

  if (!office || points == null || !rating || rankNumber == null) {
    return null
  }

  if (/^source:/i.test(office) || /^rating was generated/i.test(office)) {
    return null
  }

  return {
    office,
    points,
    rating,
    rankNumber,
    rankLabel,
  }
}

function parseMonthSheet(sheetName: string, rows: unknown[][]): UperMonthSnapshot | null {
  const monthMeta = parseSheetMonthKey(sheetName)
  const header = findHeaderRowIndex(rows)

  if (!monthMeta || !header) {
    return null
  }

  const rankings: UperRankingRow[] = []

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const firstCell = normalizeCell(row[0])
    if (!firstCell) continue
    if (/^source:/i.test(firstCell)) break

    const parsed = parseRankingRow(row, header.columnIndex)
    if (parsed) {
      rankings.push(parsed)
    }
  }

  if (rankings.length === 0) {
    return null
  }

  return {
    monthKey: monthMeta.monthKey,
    monthLabel: monthMeta.monthLabel,
    rankings,
  }
}

export function parseUperXlsx(buffer: ArrayBuffer | Buffer): ParsedUperWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const months: UperMonthSnapshot[] = []
  const skippedSheets: string[] = []

  for (const sheetName of workbook.SheetNames) {
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
      "No valid UPER month sheets were found. Dapat may worksheet bawat buwan (hal. January 2026) na may Office, Total Earned Points, Adjectival Rating, at Ranking columns.",
    )
  }

  months.sort((left, right) => left.monthKey.localeCompare(right.monthKey))

  return { months, skippedSheets }
}
