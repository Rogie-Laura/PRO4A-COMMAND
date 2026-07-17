import * as XLSX from "xlsx"

import type {
  ParsedRhsuWorkbook,
  RhsuAnalytics,
  RhsuDecalMonth,
  RhsuPurcMonth,
} from "@/lib/rhsu-types"

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }

  const match = normalize(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)
  if (!match) return 0

  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0
}

function sheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })
}

function findSheetName(workbook: XLSX.WorkBook, expected: string) {
  const normalizedExpected = expected.toLowerCase()
  return workbook.SheetNames.find(
    (name) => normalize(name).toLowerCase() === normalizedExpected,
  )
}

function parseAsOf(rows: unknown[][]) {
  for (const row of rows.slice(0, 5)) {
    for (const cell of row) {
      const text = normalize(cell)
      if (/^as of\b/i.test(text)) {
        return text.replace(/^as of\s*/i, "")
      }
    }
  }
  return ""
}

function parseDecals(rows: unknown[][]) {
  const entries: RhsuDecalMonth[] = []
  let totals = { passcards: 0, stickers: 0, total: 0 }

  for (const row of rows) {
    const label = normalize(row[0])
    if (!label || /^(month|decals application)/i.test(label) || /^as of\b/i.test(label)) {
      continue
    }

    const values = {
      passcards: parseCount(row[1]),
      stickers: parseCount(row[2]),
      total: parseCount(row[3]),
    }

    if (/^total\b/i.test(label)) {
      totals = values
      continue
    }

    entries.push({ month: label, ...values })
  }

  if (totals.total === 0 && entries.length > 0) {
    totals = entries.reduce(
      (sum, item) => ({
        passcards: sum.passcards + item.passcards,
        stickers: sum.stickers + item.stickers,
        total: sum.total + item.total,
      }),
      { passcards: 0, stickers: 0, total: 0 },
    )
  }

  return { entries, totals }
}

function parseDecalStatus(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] ?? []
    const normalized = row.map((cell) => normalize(cell).toLowerCase())
    if (!normalized.some((cell) => cell.includes("decals applied"))) continue

    const values = rows[index + 1] ?? []
    return {
      applied: parseCount(values[0]),
      claimedReleased: parseCount(values[1]),
      unclaimed: parseCount(values[2]),
    }
  }

  return { applied: 0, claimedReleased: 0, unclaimed: 0 }
}

function parsePurcs(rows: unknown[][]) {
  const entries: RhsuPurcMonth[] = []

  for (const row of rows) {
    const label = normalize(row[0])
    if (
      !label ||
      /^(month|rhq list)/i.test(label) ||
      /^as of\b/i.test(label) ||
      /^total\b/i.test(label)
    ) {
      continue
    }

    entries.push({
      month: label,
      count: parseCount(row[1]),
    })
  }

  return {
    entries,
    total: entries.reduce((sum, item) => sum + item.count, 0),
  }
}

export function emptyRhsuAnalytics(): RhsuAnalytics {
  return {
    dataReady: false,
    dataSource: "",
    lastUpdated: "",
    asOf: "",
    decalsByMonth: [],
    decalsTotals: { passcards: 0, stickers: 0, total: 0 },
    decalStatus: { applied: 0, claimedReleased: 0, unclaimed: 0 },
    purcsByMonth: [],
    purcsTotal: 0,
  }
}

export function parseRhsuXlsx(buffer: ArrayBuffer | Buffer): ParsedRhsuWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const decalsSheet = findSheetName(workbook, "DECALS 2026")
  const statusSheet = findSheetName(workbook, "Decals Status")
  const purcsSheet = findSheetName(workbook, "PURCs 2026")

  if (!decalsSheet || !statusSheet || !purcsSheet) {
    throw new Error(
      'Kailangan ang sheets na "DECALS 2026", "Decals Status", at "PURCs 2026".',
    )
  }

  const decalRows = sheetRows(workbook, decalsSheet)
  const statusRows = sheetRows(workbook, statusSheet)
  const purcRows = sheetRows(workbook, purcsSheet)
  const decals = parseDecals(decalRows)
  const purcs = parsePurcs(purcRows)
  const decalStatus = parseDecalStatus(statusRows)

  if (decals.entries.length === 0) {
    throw new Error('Walang valid na monthly data sa "DECALS 2026" sheet.')
  }

  return {
    sheetNames: [decalsSheet, statusSheet, purcsSheet],
    analytics: {
      dataReady: true,
      dataSource: "",
      lastUpdated: new Date().toISOString(),
      asOf: parseAsOf(decalRows) || parseAsOf(purcRows),
      decalsByMonth: decals.entries,
      decalsTotals: decals.totals,
      decalStatus,
      purcsByMonth: purcs.entries,
      purcsTotal: purcs.total,
    },
  }
}
