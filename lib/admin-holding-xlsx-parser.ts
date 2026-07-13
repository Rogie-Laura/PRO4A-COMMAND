import * as XLSX from "xlsx"

import { parseAdminHoldingRows } from "@/lib/admin-holding-analytics"
import type { ParsedAdminHoldingWorkbook } from "@/lib/admin-holding-types"

export const ADMIN_HOLDING_SHEET_NAME = "Admin Holding"

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

function resolveAdminHoldingSheet(workbook: XLSX.WorkBook) {
  const matchedName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === ADMIN_HOLDING_SHEET_NAME.toLowerCase(),
  )

  if (!matchedName) return null

  return {
    name: matchedName,
    sheet: workbook.Sheets[matchedName],
  }
}

export function parseAdminHoldingXlsx(buffer: ArrayBuffer | Buffer): ParsedAdminHoldingWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })
  const resolved = resolveAdminHoldingSheet(workbook)

  if (!resolved) {
    throw new Error(`Walang "${ADMIN_HOLDING_SHEET_NAME}" sheet sa workbook.`)
  }

  const rows = sheetRowsToStrings(resolved.sheet)
  const records = parseAdminHoldingRows(rows)

  if (records.length === 0) {
    throw new Error(`Walang valid na admin holding records sa ${ADMIN_HOLDING_SHEET_NAME} sheet.`)
  }

  return {
    sheetName: resolved.name.trim(),
    records,
  }
}
