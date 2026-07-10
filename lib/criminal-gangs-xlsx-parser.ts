import type {
  CriminalGangsCountRow,
  CriminalGangsGroupSummary,
  CriminalGangsOverview,
  ParsedCriminalGangsWorkbook,
} from "@/lib/criminal-gangs-types"
import * as XLSX from "xlsx"

const GROUP_COLUMNS = {
  drug: { arrested: 1, surrendered: 2, dpo: 3, total: 4 },
  gunForHire: { arrested: 5, surrendered: 6, dpo: 7, total: 8 },
  otherCriminal: { arrested: 9, surrendered: 10, dpo: 11, total: 12 },
} as const

type GroupCounts = {
  arrested: number
  surrendered: number
  dpo: number
  total: number
}

type ParsedUnitRow = {
  unit: string
  isTotal: boolean
  drug: GroupCounts
  gunForHire: GroupCounts
  otherCriminal: GroupCounts
  grandTotal: number
}

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value))
  }

  const text = normalizeCell(value).replace(/,/g, "")
  if (!text) return 0

  const parsed = Number(text)
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

function readGroupCounts(row: unknown[], columns: { arrested: number; surrendered: number; dpo: number; total: number }) {
  return {
    arrested: parseCount(row[columns.arrested]),
    surrendered: parseCount(row[columns.surrendered]),
    dpo: parseCount(row[columns.dpo]),
    total: parseCount(row[columns.total]),
  }
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const first = normalizeCell(row[0]).toLowerCase()
    if (first !== "unit") continue

    const nextRow = rows[index + 1]
    if (!Array.isArray(nextRow)) continue

    const hasDrugHeaders =
      normalizeCell(nextRow[1]).toLowerCase() === "arrested" &&
      normalizeCell(nextRow[5]).toLowerCase() === "arrested"

    if (!hasDrugHeaders) continue

    return {
      headerRowIndex: index + 1,
      grandTotalColumn: 13,
    }
  }

  return null
}

function parseUnitRows(rows: unknown[][], header: { headerRowIndex: number; grandTotalColumn: number }) {
  const parsedRows: ParsedUnitRow[] = []

  for (let rowIndex = header.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const unit = normalizeCell(row[0])
    if (!unit) continue

    if (/^note:/i.test(unit) || /updated breakdown/i.test(unit)) {
      break
    }

    const counts = {
      drug: readGroupCounts(row, GROUP_COLUMNS.drug),
      gunForHire: readGroupCounts(row, GROUP_COLUMNS.gunForHire),
      otherCriminal: readGroupCounts(row, GROUP_COLUMNS.otherCriminal),
      grandTotal: parseCount(row[header.grandTotalColumn]),
    }

    const isTotal = /^total\b/i.test(unit)

    parsedRows.push({
      unit,
      isTotal,
      ...counts,
    })

    if (isTotal) break
  }

  return parsedRows
}

function toCountRows(
  rows: ParsedUnitRow[],
  pickCounts: (row: ParsedUnitRow) => GroupCounts,
): CriminalGangsCountRow[] {
  return rows.map((row) => {
    const counts = pickCounts(row)
    return {
      unit: row.unit,
      arrested: counts.arrested,
      surrendered: counts.surrendered,
      dpo: counts.dpo,
      total: counts.total,
      isTotal: row.isTotal,
    }
  })
}

function buildGroupSummary(
  groupKey: CriminalGangsGroupSummary["groupKey"],
  label: string,
  rows: ParsedUnitRow[],
  pickCounts: (row: ParsedUnitRow) => GroupCounts,
): CriminalGangsGroupSummary {
  const unitRows = toCountRows(rows, pickCounts)
  const totalRow = unitRows.find((row) => row.isTotal)

  return {
    groupKey,
    label,
    arrested: totalRow?.arrested ?? 0,
    surrendered: totalRow?.surrendered ?? 0,
    dpo: totalRow?.dpo ?? 0,
    total: totalRow?.total ?? 0,
    unitRows,
  }
}

function buildOverview(rows: ParsedUnitRow[]): CriminalGangsOverview {
  const totalRow = rows.find((row) => row.isTotal)

  return {
    grandTotal: totalRow?.grandTotal ?? 0,
    drugTotal: totalRow?.drug.total ?? 0,
    gunForHireTotal: totalRow?.gunForHire.total ?? 0,
    otherCriminalTotal: totalRow?.otherCriminal.total ?? 0,
    unitRows: rows.map((row) => ({
      unit: row.unit,
      grandTotal: row.grandTotal,
      isTotal: row.isTotal,
    })),
  }
}

function parseSheet(sheet: XLSX.WorkSheet): ParsedCriminalGangsWorkbook | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) return null

  const unitRows = parseUnitRows(rows, header)
  if (unitRows.length === 0) return null

  return {
    title: normalizeCell(rows[0]?.[0]) || "ACCOMPLISHMENTS ON CRIMINAL GANGS",
    periodLabel: normalizeCell(rows[1]?.[0]),
    overview: buildOverview(unitRows),
    drugGroups: buildGroupSummary("drug", "Drug Groups", unitRows, (row) => row.drug),
    gunForHireGroups: buildGroupSummary(
      "gunForHire",
      "Gun-for-Hire Groups",
      unitRows,
      (row) => row.gunForHire,
    ),
    otherCriminalGroups: buildGroupSummary(
      "otherCriminal",
      "Other Criminal Groups",
      unitRows,
      (row) => row.otherCriminal,
    ),
  }
}

function resolveSheet(workbook: XLSX.WorkBook) {
  const namedSheet = workbook.Sheets["Sheet1"]
  if (namedSheet) return namedSheet

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    })
    const title = normalizeCell(rows[0]?.[0]).toLowerCase()
    if (title.includes("criminal gangs")) {
      return sheet
    }
  }

  return workbook.Sheets[workbook.SheetNames[0]]
}

export function parseCriminalGangsXlsx(buffer: ArrayBuffer | Buffer): ParsedCriminalGangsWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })
  const sheet = resolveSheet(workbook)

  if (!sheet) {
    throw new Error("Walang valid sheet sa criminal gangs workbook.")
  }

  const parsed = parseSheet(sheet)
  if (!parsed) {
    throw new Error("Walang valid na criminal gangs summary table sa workbook.")
  }

  return parsed
}
