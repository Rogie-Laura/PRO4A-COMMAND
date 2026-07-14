import * as XLSX from "xlsx"

import { buildIctEquipmentAnalyticsFromRows } from "@/lib/ict-equipment-parse"
import type { ParsedIctRecapWorkbook } from "@/lib/ict-equipment-types"

export const ICT_RECAP_SHEET_NAME = "RECAP"

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
    .replace(/\r\n/g, " ")
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

function resolveRecapSheet(workbook: XLSX.WorkBook) {
  const matchedName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === ICT_RECAP_SHEET_NAME.toLowerCase(),
  )

  if (!matchedName) return null

  return {
    name: matchedName,
    sheet: workbook.Sheets[matchedName],
  }
}

export function parseIctEquipmentXlsx(buffer: ArrayBuffer | Buffer): ParsedIctRecapWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })
  const resolved = resolveRecapSheet(workbook)

  if (!resolved) {
    throw new Error(`Walang "${ICT_RECAP_SHEET_NAME}" sheet sa ICT inventory workbook.`)
  }

  const rows = sheetRowsToStrings(resolved.sheet)
  const analytics = buildIctEquipmentAnalyticsFromRows(rows, {
    fileName: "",
    lastUpdated: new Date().toISOString(),
  })

  if (!analytics.dataReady) {
    throw new Error(
      "Walang valid na RECAP simplified blocks (row 18+) sa ICT inventory workbook.",
    )
  }

  return {
    sheetName: resolved.name.trim(),
    analytics,
  }
}
