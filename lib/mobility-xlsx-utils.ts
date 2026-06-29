import * as XLSX from "xlsx"

export function parseMobilityNumber(value: unknown) {
  if (value == null || value === "") return 0
  if (typeof value === "number" && Number.isFinite(value)) return value

  const trimmed = String(value).replace(/,/g, "").trim()
  if (!trimmed) return 0

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : 0
}

export function parseMobilityOptionalNumber(value: unknown) {
  if (value == null || value === "") return null

  const parsed = parseMobilityNumber(value)
  return parsed === 0 && String(value).trim() === "" ? null : parsed
}

export function parseMobilityFillRate(value: unknown) {
  if (value == null || value === "") return null

  const parsed = parseMobilityNumber(value)
  if (parsed === 0 && String(value).trim() === "") return null

  return parsed <= 1 ? Math.round(parsed * 10000) / 100 : Math.round(parsed * 100) / 100
}

export function readMobilityCell(row: unknown[], index: number) {
  return row[index]
}

export function sheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return null

  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })
}

export function findSheetName(workbook: XLSX.WorkBook, expected: string) {
  return (
    workbook.SheetNames.find((name) => name.trim().toUpperCase() === expected.toUpperCase()) ??
    null
  )
}

export function parseAsOfFromRows(rows: unknown[][]) {
  for (const row of rows.slice(0, 4)) {
    if (!Array.isArray(row)) continue
    const text = String(readMobilityCell(row, 0) ?? "").trim()
    const match = text.match(/AS OF\s+(.+)/i)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return null
}
