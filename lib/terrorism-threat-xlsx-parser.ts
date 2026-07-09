import * as XLSX from "xlsx"

import type {
  ParsedTerrorismThreatWorkbook,
  TerrorismThreatRow,
} from "@/lib/terrorism-threat-types"

const TERRORISM_THREAT_SHEET = "Terrorism Threat Level"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function normalizeHeader(value: unknown) {
  return normalizeCell(value).toLowerCase()
}

function splitProvinces(value: unknown) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((part) => part.trim().replace(/\s+/g, " "))
    .filter(Boolean)
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const headers = row.map(normalizeHeader)
    const provinceIndex = headers.findIndex((header) => header.includes("province"))
    const threatIndex = headers.findIndex((header) => header.includes("threat level"))
    const securityIndex = headers.findIndex((header) => header.includes("security measure"))
    const parameterIndex = headers.indexOf("parameter")

    if (provinceIndex >= 0 && threatIndex >= 0 && securityIndex >= 0 && parameterIndex >= 0) {
      return {
        headerRowIndex: index,
        columnIndex: {
          province: provinceIndex,
          threatLevel: threatIndex,
          securityMeasure: securityIndex,
          parameter: parameterIndex,
        },
      }
    }
  }

  return null
}

function findPeriodLabel(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue

    const text = normalizeCell(row[0])
    if (/terrorism threat level/i.test(text)) {
      return text
    }
  }

  return "Terrorism Threat Level"
}

function findNote(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue

    for (const cell of row) {
      const text = normalizeCell(cell)
      if (/^note:/i.test(text)) {
        return text
      }
    }
  }

  return ""
}

function expandThreatRows(
  row: unknown[],
  columnIndex: {
    province: number
    threatLevel: number
    securityMeasure: number
    parameter: number
  },
): TerrorismThreatRow[] {
  const provinces = splitProvinces(row[columnIndex.province])
  const threatLevel = normalizeCell(row[columnIndex.threatLevel])
  const securityMeasure = normalizeCell(row[columnIndex.securityMeasure])
  const parameter = normalizeCell(row[columnIndex.parameter])

  if (provinces.length === 0 || !threatLevel) {
    return []
  }

  return provinces.map((province) => ({
    province,
    threatLevel,
    securityMeasure,
    parameter,
  }))
}

export function parseTerrorismThreatXlsx(buffer: ArrayBuffer | Buffer): ParsedTerrorismThreatWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheet = workbook.Sheets[TERRORISM_THREAT_SHEET]

  if (!sheet) {
    throw new Error(`Walang "${TERRORISM_THREAT_SHEET}" sheet sa workbook.`)
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) {
    throw new Error(
      "Hindi mahanap ang Terrorism Threat Level table. Dapat may Province, Threat Level, Security Measure, at Parameter columns.",
    )
  }

  const parsedRows: TerrorismThreatRow[] = []

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const firstCell = normalizeCell(row[header.columnIndex.province])
    if (!firstCell) continue
    if (/^note:/i.test(firstCell)) break

    parsedRows.push(...expandThreatRows(row, header.columnIndex))
  }

  if (parsedRows.length === 0) {
    throw new Error("Walang terrorism threat level rows sa workbook.")
  }

  return {
    periodLabel: findPeriodLabel(rows),
    rows: parsedRows,
    note: findNote(rows),
  }
}
