import * as XLSX from "xlsx"

import { parseDetailedPersonnelRows } from "@/lib/detailed-personnel-analytics"
import { parsePersonnelGainsLossesRows } from "@/lib/personnel-gains-losses-parser"
import type { PersonnelGainsLosses } from "@/lib/personnel-gains-losses-types"
import { DETAILED_PERSONNEL_SHEET } from "@/lib/detailed-personnel-sheet"
import type { DetailedPersonnelTabKey } from "@/lib/detailed-personnel-types"
import { mapPersonnelRow } from "@/lib/personnel-aggregations"
import type { PersonnelRecord } from "@/lib/personnel-types"
import type { ParsedRprmdWorkbook } from "@/lib/rprmd-workbook-types"
import { parseSchoolingRows } from "@/lib/schooling-analytics"

const EXCLUDED_SHEETS = new Set(["rphas", "pro4a-command"])

const ALPHALIST_REQUIRED_HEADERS = ["rank", "lastname", "subunit"]

const DETAILED_SHEET_MATCHERS: { pattern: RegExp; tab: DetailedPersonnelTabKey }[] = [
  { pattern: /^detailed\s+nhq$/i, tab: "nhq" },
  { pattern: /^detailed\s+to\s+nosus$/i, tab: "nosus" },
  { pattern: /^detailed\s+to\s+rsu$/i, tab: "rsu" },
  { pattern: /^detailed\s+to\s+rhq\s*&\s*ppo$/i, tab: "rhqPpo" },
]

const SCHOOLING_SHEET_MATCHERS: { pattern: RegExp; kind: "mandatory" | "specialized" }[] = [
  { pattern: /mandatory.*schooling/i, kind: "mandatory" },
  { pattern: /specialized.*schooling/i, kind: "specialized" },
]

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
}

function formatPersonnelDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const month = value.getMonth() + 1
    const day = value.getDate()
    const year = value.getFullYear()
    return `${month}/${day}/${year}`
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 20000 && value < 80000) {
    // Excel serial date (days since 1899-12-30).
    const parsed = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000)
    if (!Number.isNaN(parsed.getTime())) {
      const month = parsed.getUTCMonth() + 1
      const day = parsed.getUTCDate()
      const year = parsed.getUTCFullYear()
      return `${month}/${day}/${year}`
    }
  }

  return String(value ?? "").trim()
}

function formatXlsxCell(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
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

function isExcludedSheet(name: string) {
  return EXCLUDED_SHEETS.has(name.trim().toLowerCase())
}

function isAlphalistHeaderRow(headers: string[]) {
  const normalized = headers.map(normalizeHeader)
  return ALPHALIST_REQUIRED_HEADERS.every((header) => normalized.includes(header))
}

function findAlphalistSheet(workbook: XLSX.WorkBook) {
  for (const name of workbook.SheetNames) {
    if (isExcludedSheet(name)) continue

    const sheet = workbook.Sheets[name]
    if (!sheet) continue

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    })
    const headerRow = rows[0]
    if (!Array.isArray(headerRow)) continue

    const headers = headerRow.map((cell) => String(cell ?? "").trim())
    if (!isAlphalistHeaderRow(headers)) continue

    return { name, sheet, headers }
  }

  return null
}

function parseAlphalistRecords(sheet: XLSX.WorkSheet, headers: string[]): PersonnelRecord[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const dateHeaders = new Set(
    [
      "BirthDate",
      "Date Entered Service",
      "Designation Date",
      "Last Promotion Date",
      "Date Of Officership Or Commission",
      "PStatus Date",
    ].map(normalizeHeader),
  )

  const records: PersonnelRecord[] = []

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) continue

    const mapped: Record<string, string> = {}
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index]?.trim()
      if (!header) continue

      const value = row[index]
      mapped[header] = dateHeaders.has(normalizeHeader(header))
        ? formatPersonnelDate(value)
        : String(value ?? "").trim()
    }

    const record = mapPersonnelRow(mapped)
    if (record.lastName || record.firstName) {
      records.push(record)
    }
  }

  return records
}

function findSchoolingDataStart(rows: string[][]) {
  for (let index = 0; index < Math.min(rows.length, 8); index += 1) {
    const first = rows[index]?.[0]?.trim().toLowerCase() ?? ""
    const second = rows[index]?.[1]?.trim().toLowerCase() ?? ""
    const third = rows[index]?.[2]?.trim().toLowerCase() ?? ""

    if (first === "nr" && second === "rank" && third === "name") {
      return index + 2
    }
  }

  return -1
}

function parseSchoolingSheet(sheet: XLSX.WorkSheet) {
  const rows = sheetRowsToStrings(sheet)
  const start = findSchoolingDataStart(rows)
  if (start < 0) return []

  return parseSchoolingRows(rows.slice(start))
}

function resolveDetailedTab(sheetName: string): DetailedPersonnelTabKey | null {
  const trimmed = sheetName.trim()
  for (const matcher of DETAILED_SHEET_MATCHERS) {
    if (matcher.pattern.test(trimmed)) {
      return matcher.tab
    }
  }

  return null
}

function resolveSchoolingKind(sheetName: string): "mandatory" | "specialized" | null {
  for (const matcher of SCHOOLING_SHEET_MATCHERS) {
    if (matcher.pattern.test(sheetName.trim())) {
      return matcher.kind
    }
  }

  return null
}

function findGainsLossesSheet(workbook: XLSX.WorkBook) {
  const sheetName = workbook.SheetNames.find((name) => name.trim().toLowerCase() === "g&l")
  if (!sheetName) return null

  return workbook.Sheets[sheetName] ?? null
}

function parseGainsLossesSheet(sheet: XLSX.WorkSheet): PersonnelGainsLosses {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  return parsePersonnelGainsLossesRows(rows.filter((row) => Array.isArray(row)))
}

export function parseRprmdWorkbookXlsx(buffer: ArrayBuffer | Buffer): ParsedRprmdWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const alphalist = findAlphalistSheet(workbook)

  if (!alphalist) {
    throw new Error(
      'Walang Alphalist sheet sa workbook. Kailangan ang sheet na may Rank, Last Name, at Sub Unit columns.',
    )
  }

  const personnelRecords = parseAlphalistRecords(alphalist.sheet, alphalist.headers)
  if (personnelRecords.length === 0) {
    throw new Error(`Walang valid na personnel records sa ${alphalist.name} sheet.`)
  }

  const mandatorySchooling: ParsedRprmdWorkbook["mandatorySchooling"] = []
  const specializedSchooling: ParsedRprmdWorkbook["specializedSchooling"] = []
  const detailed: ParsedRprmdWorkbook["detailed"] = {
    nhq: [],
    nosus: [],
    rsu: [],
    rhqPpo: [],
  }

  for (const sheetName of workbook.SheetNames) {
    if (isExcludedSheet(sheetName) || sheetName.trim().toLowerCase() === "g&l" || sheetName === alphalist.name) {
      continue
    }

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const schoolingKind = resolveSchoolingKind(sheetName)
    if (schoolingKind === "mandatory") {
      mandatorySchooling.push(...parseSchoolingSheet(sheet))
      continue
    }

    if (schoolingKind === "specialized") {
      specializedSchooling.push(...parseSchoolingSheet(sheet))
      continue
    }

    const detailedTab = resolveDetailedTab(sheetName)
    if (detailedTab) {
      detailed[detailedTab] = parseDetailedPersonnelRows(sheetRowsToStrings(sheet))
    }
  }

  const gainsLossesSheet = findGainsLossesSheet(workbook)
  const personnelGainsLosses = gainsLossesSheet ? parseGainsLossesSheet(gainsLossesSheet) : null

  return {
    alphalistSheetName: alphalist.name.trim(),
    personnelRecords,
    mandatorySchooling,
    specializedSchooling,
    detailed,
    personnelGainsLosses,
  }
}

export function getDetailedTabLabel(tab: DetailedPersonnelTabKey) {
  return DETAILED_PERSONNEL_SHEET.tabs[tab].label
}
