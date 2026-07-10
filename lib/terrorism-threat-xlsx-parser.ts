import * as XLSX from "xlsx"

import {
  TERRORISM_THREAT_REGION_LABEL,
  type ParsedTerrorismThreatWorkbook,
  type TerrorismThreatRow,
} from "@/lib/terrorism-threat-types"

const TERRORISM_THREAT_SHEET_NAMES = [
  "THREAT LEVEL",
  "Terrorism Threat Level",
  "Threat Level",
]

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function normalizeHeader(value: unknown) {
  return normalizeCell(value).toLowerCase()
}

function findThreatSheet(workbook: XLSX.WorkBook) {
  for (const preferredName of TERRORISM_THREAT_SHEET_NAMES) {
    if (workbook.Sheets[preferredName]) {
      return workbook.Sheets[preferredName]
    }
  }

  const matchedName = workbook.SheetNames.find((name) =>
    /threat\s*level/i.test(normalizeCell(name)),
  )

  return matchedName ? workbook.Sheets[matchedName] : undefined
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

function parseRegionThreatRow(
  row: unknown[],
  columnIndex: {
    province: number
    threatLevel: number
    securityMeasure: number
    parameter: number
  },
): TerrorismThreatRow | null {
  const provinceCell = normalizeCell(row[columnIndex.province])
  const threatLevel = normalizeCell(row[columnIndex.threatLevel])
  const securityMeasure = normalizeCell(row[columnIndex.securityMeasure])
  const parameter = normalizeCell(row[columnIndex.parameter])

  if (!provinceCell || !threatLevel) {
    return null
  }

  return {
    region: TERRORISM_THREAT_REGION_LABEL,
    threatLevel,
    securityMeasure,
    parameter,
  }
}

export function parseTerrorismThreatXlsx(buffer: ArrayBuffer | Buffer): ParsedTerrorismThreatWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheet = findThreatSheet(workbook)

  if (!sheet) {
    throw new Error(
      'Walang "THREAT LEVEL" o "Terrorism Threat Level" sheet sa workbook.',
    )
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) {
    throw new Error(
      "Hindi mahanap ang threat level table. Dapat may Province, Threat Level, Security Measure, at Parameter columns.",
    )
  }

  let regionThreat: TerrorismThreatRow | null = null

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const firstCell = normalizeCell(row[header.columnIndex.province])
    if (!firstCell) continue
    if (/^note:/i.test(firstCell)) break

    regionThreat = parseRegionThreatRow(row, header.columnIndex)
    if (regionThreat) break
  }

  if (!regionThreat) {
    throw new Error("Walang valid na CALABARZON terrorism threat level row sa workbook.")
  }

  return {
    periodLabel: findPeriodLabel(rows),
    rows: [regionThreat],
    note: findNote(rows),
  }
}
