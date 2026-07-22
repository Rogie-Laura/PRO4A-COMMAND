import * as XLSX from "xlsx"

import type {
  ParsedRcdWorkbook,
  RcdAnalytics,
  RcdRetireeRecord,
  RcdYearGroup,
} from "@/lib/rcd-types"

function normalize(value: unknown) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .trim()
}

function collapseSpaces(value: string) {
  return value.replace(/[ \t]+/g, " ").trim()
}

function sheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })
}

function excelSerialToIso(value: number) {
  const parsed = XLSX.SSF.parse_date_code(value)
  if (!parsed) return ""
  const month = String(parsed.m).padStart(2, "0")
  const day = String(parsed.d).padStart(2, "0")
  return `${parsed.y}-${month}-${day}`
}

function formatDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToIso(value)
  }

  const text = normalize(value)
  if (!text) return ""

  const parsed = Date.parse(text)
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return text
}

function formatDisplayDate(isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate || "—"
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function parseYearFromSheetName(sheetName: string) {
  const match = sheetName.match(/(20\d{2})/)
  return match ? Number(match[1]) : null
}

function parseAsOf(title: string) {
  const match = title.match(/as of\s+(.+)$/i)
  return match ? collapseSpaces(match[1]) : ""
}

function isCompleteClaim(value: string) {
  const normalized = value.toLowerCase()
  if (!normalized) return false
  return (
    /^completed\b/.test(normalized) ||
    /^complete requirements\b/.test(normalized) ||
    normalized === "complete"
  )
}

function isPersonName(value: string) {
  if (!value) return false
  if (/^(no\.?|name|unit|date|type|remarks|total|jan|feb|mar|apr|may|june|july|aug|sept|oct|nov|dec|1st|2nd|3rd|4th)$/i.test(value)) {
    return false
  }
  if (/^\d+$/.test(value)) return false
  // Rank/name rows usually include letters and spaces.
  return /[A-Za-z]{2,}/.test(value)
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < Math.min(rows.length, 10); index += 1) {
    const row = rows[index] ?? []
    const labels = row.map((cell) => normalize(cell).toLowerCase())
    if (labels.includes("name") && labels.some((label) => label.includes("date"))) {
      return index
    }
  }
  return -1
}

function columnIndex(row: unknown[], matcher: (label: string) => boolean) {
  return row.findIndex((cell) => matcher(normalize(cell).toLowerCase()))
}

function parseSheet(sheetName: string, rows: unknown[][]): RcdYearGroup | null {
  const year = parseYearFromSheetName(sheetName)
  if (!year) return null

  const title = collapseSpaces(normalize(rows[0]?.[0]).replace(/\n/g, " "))
  const headerIndex = findHeaderRow(rows)
  if (headerIndex < 0) return null

  const header = rows[headerIndex] ?? []
  const subHeader = rows[headerIndex + 1] ?? []

  const numberIdx = columnIndex(header, (label) => label === "no." || label === "no")
  const nameIdx = columnIndex(header, (label) => label === "name")
  const unitIdx = columnIndex(header, (label) => label === "unit")
  const dateIdx = columnIndex(header, (label) => label.includes("date"))
  const typeIdx = columnIndex(header, (label) => label.includes("type of claim") || label === "type")
  const remarksIdx = columnIndex(header, (label) => label.includes("remark"))

  if (nameIdx < 0 || dateIdx < 0) return null

  let calIdx = typeIdx
  let lumpIdx = typeIdx >= 0 ? typeIdx + 1 : -1

  for (let index = 0; index < subHeader.length; index += 1) {
    const label = normalize(subHeader[index]).toLowerCase()
    if (label === "cal") calIdx = index
    if (label.includes("lump")) lumpIdx = index
  }

  const retirees: RcdRetireeRecord[] = []
  const dataStart = headerIndex + (subHeader.some((cell) => normalize(cell)) ? 2 : 1)

  for (let rowIndex = dataStart; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? []
    const name = collapseSpaces(normalize(row[nameIdx]))
    if (!isPersonName(name)) continue
    if (/^total\b/i.test(name)) continue

    const numberRaw = numberIdx >= 0 ? row[numberIdx] : null
    const number =
      typeof numberRaw === "number" && Number.isFinite(numberRaw)
        ? Math.trunc(numberRaw)
        : Number.parseInt(normalize(numberRaw), 10) || null

    const retirementDate = formatDate(row[dateIdx])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(retirementDate)) continue

    const calClaim = collapseSpaces(normalize(calIdx >= 0 ? row[calIdx] : "").replace(/\n/g, " / "))
    const lumpSumClaim = collapseSpaces(
      normalize(lumpIdx >= 0 ? row[lumpIdx] : "").replace(/\n/g, " / "),
    )
    const remarks = collapseSpaces(
      normalize(remarksIdx >= 0 ? row[remarksIdx] : "").replace(/\n+/g, " "),
    )
    const notesParts: string[] = []
    for (let col = 0; col < row.length; col += 1) {
      if (
        col === numberIdx ||
        col === nameIdx ||
        col === unitIdx ||
        col === dateIdx ||
        col === calIdx ||
        col === lumpIdx ||
        col === remarksIdx
      ) {
        continue
      }
      const extra = collapseSpaces(normalize(row[col]).replace(/\n+/g, " "))
      if (extra && extra !== "-") notesParts.push(extra)
    }

    const isComplete = isCompleteClaim(calClaim)

    retirees.push({
      id: `${year}-${number ?? rowIndex}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      year,
      number,
      name,
      unit: unitIdx >= 0 ? collapseSpaces(normalize(row[unitIdx])) : "",
      retirementDate,
      calClaim,
      lumpSumClaim,
      remarks,
      notes: notesParts.join(" · "),
      isComplete,
    })
  }

  const completed = retirees.filter((item) => item.isComplete).length

  return {
    year,
    asOf: parseAsOf(title),
    title: title || `Compulsory Retirees ${year}`,
    total: retirees.length,
    completed,
    lacking: retirees.length - completed,
    retirees,
  }
}

export function emptyRcdAnalytics(): RcdAnalytics {
  return {
    dataReady: false,
    dataSource: "",
    lastUpdated: "",
    asOf: "",
    totalRetirees: 0,
    completedCount: 0,
    lackingCount: 0,
    years: [],
  }
}

export function parseRcdXlsx(buffer: Buffer): ParsedRcdWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const years: RcdYearGroup[] = []

  for (const sheetName of workbook.SheetNames) {
    if (!/compulsory/i.test(sheetName)) continue
    const group = parseSheet(sheetName, sheetRows(workbook, sheetName))
    if (group && group.retirees.length > 0) {
      years.push(group)
    }
  }

  years.sort((left, right) => right.year - left.year)

  if (years.length === 0) {
    throw new Error(
      'Walang compulsory retirees sheet na nahanap. Inaasahan ang sheets tulad ng "Compulsory 2026".',
    )
  }

  const totalRetirees = years.reduce((sum, year) => sum + year.total, 0)
  const completedCount = years.reduce((sum, year) => sum + year.completed, 0)

  return {
    sheetNames: workbook.SheetNames,
    analytics: {
      dataReady: true,
      dataSource: "",
      lastUpdated: "",
      asOf: years.map((year) => year.asOf).filter(Boolean).join(" · "),
      totalRetirees,
      completedCount,
      lackingCount: totalRetirees - completedCount,
      years,
    },
  }
}

export function formatRcdRetirementDate(isoDate: string) {
  return formatDisplayDate(isoDate)
}
