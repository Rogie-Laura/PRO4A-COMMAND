import * as XLSX from "xlsx"

import { parseTrainingsRowsWithMeta } from "@/lib/trainings-analytics"
import type { ParsedTrainingsWorkbook } from "@/lib/trainings-types"

export const TRAININGS_DET_SHEET_PATTERN = /4th\s+UPDATED\s+DET/i

function formatXlsxCell(value: unknown) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(value)
  }

  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function sheetRowsToStrings(sheet: XLSX.WorkSheet) {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  return rows.map((row) => (Array.isArray(row) ? row.map(formatXlsxCell) : []))
}

function resolveDetSheet(workbook: XLSX.WorkBook) {
  const matchedName = workbook.SheetNames.find((name) => TRAININGS_DET_SHEET_PATTERN.test(name))
  if (!matchedName) return null

  return {
    name: matchedName,
    sheet: workbook.Sheets[matchedName],
  }
}

export function parseTrainingsXlsx(buffer: ArrayBuffer | Buffer): ParsedTrainingsWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })
  const resolved = resolveDetSheet(workbook)

  if (!resolved) {
    throw new Error('Walang "4th UPDATED DET" sheet sa RTAP workbook.')
  }

  const rows = sheetRowsToStrings(resolved.sheet)
  const { records, plannedTotalClasses } = parseTrainingsRowsWithMeta(rows)

  if (records.length === 0) {
    throw new Error("Walang valid na RTAP training records sa 4th UPDATED DET sheet.")
  }

  return {
    sheetName: resolved.name.trim(),
    records,
    plannedTotalClasses,
  }
}
