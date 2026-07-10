import type {
  IllegalDrugsPpoRow,
  IllegalDrugsSheetSummary,
  ParsedIllegalDrugsWorkbook,
} from "@/lib/illegal-drugs-types"
import * as XLSX from "xlsx"

const SHEET_CONFIG = [
  { sheetName: "HVI", sheetKey: "hvi" as const },
  { sheetName: "SLI", sheetKey: "sli" as const },
]

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

function isYellowFill(cell: XLSX.CellObject | undefined) {
  if (!cell?.s) return false

  const rgb = String(cell.s.fgColor?.rgb || cell.s.fill?.fgColor?.rgb || "").toUpperCase()
  return (
    rgb === "FFFF00" ||
    rgb === "FFFFFF00" ||
    rgb === "FFEB9C" ||
    rgb === "FFF2CC" ||
    rgb.endsWith("FFFF00")
  )
}

function rowHasYellowDataHighlight(
  sheet: XLSX.WorkSheet,
  rowIndex: number,
  dataColumnStart: number,
  dataColumnEnd: number,
) {
  for (let column = dataColumnStart; column <= dataColumnEnd; column += 1) {
    const address = XLSX.utils.encode_cell({ r: rowIndex, c: column })
    if (isYellowFill(sheet[address])) {
      return true
    }
  }

  return false
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const first = normalizeCell(row[0]).toLowerCase()
    const second = normalizeCell(row[1]).toLowerCase()

    if (first === "ppos" && second === "arrested") {
      return {
        headerRowIndex: index,
        ppoColumn: 0,
        arrestedColumn: 1,
        surrenderedColumn: 2,
        dpoColumn: 3,
        totalColumn: 4,
      }
    }

    if (first === "ppos") {
      const nextRow = rows[index + 1]
      if (!Array.isArray(nextRow)) continue

      const arrestedIndex = nextRow.findIndex(
        (cell) => normalizeCell(cell).toLowerCase() === "arrested",
      )
      if (arrestedIndex < 0) continue

      return {
        headerRowIndex: index + 1,
        ppoColumn: 0,
        arrestedColumn: arrestedIndex,
        surrenderedColumn: arrestedIndex + 1,
        dpoColumn: arrestedIndex + 2,
        totalColumn: arrestedIndex + 3,
      }
    }
  }

  return null
}

function findBreakdownAsOf(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue

    const text = normalizeCell(row[0])
    if (/updated breakdown/i.test(text)) {
      return text
    }
  }

  return ""
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

function parseSheet(
  sheet: XLSX.WorkSheet,
  sheetKey: "hvi" | "sli",
): IllegalDrugsSheetSummary | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) {
    return null
  }

  const parsedRows: IllegalDrugsPpoRow[] = []

  for (let rowIndex = header.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const ppo = normalizeCell(row[header.ppoColumn])
    if (!ppo) {
      if (parsedRows.length > 0) break
      continue
    }

    if (/^note:/i.test(ppo) || /updated breakdown/i.test(ppo)) {
      break
    }

    const arrested = parseCount(row[header.arrestedColumn])
    const surrendered = parseCount(row[header.surrenderedColumn])
    const dpo = parseCount(row[header.dpoColumn])
    const total = parseCount(row[header.totalColumn])
    const isTotal = /^total\b/i.test(ppo)
    const isYellow = rowHasYellowDataHighlight(
      sheet,
      rowIndex,
      header.arrestedColumn,
      header.totalColumn,
    )

    // Main summary table: rows up to TOTAL (yellow and non-yellow, e.g. HVI RPDEU).
    // Breakdown section below is excluded by stopping after TOTAL.
    const belongsToSummaryTable =
      isYellow || isTotal || arrested > 0 || surrendered > 0 || dpo > 0 || total > 0

    if (!belongsToSummaryTable) {
      continue
    }

    parsedRows.push({
      ppo,
      arrested,
      surrendered,
      dpo,
      total,
      isTotal,
    })

    if (isTotal) {
      break
    }
  }

  if (parsedRows.length === 0) {
    return null
  }

  return {
    sheetKey,
    title: normalizeCell(rows[0]?.[0]) || (sheetKey === "hvi" ? "HVI" : "SLI"),
    periodLabel: normalizeCell(rows[1]?.[0]),
    note: findNote(rows),
    breakdownAsOf: findBreakdownAsOf(rows),
    rows: parsedRows,
  }
}

export function parseIllegalDrugsXlsx(buffer: ArrayBuffer | Buffer): ParsedIllegalDrugsWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellStyles: true })

  let hvi: IllegalDrugsSheetSummary | null = null
  let sli: IllegalDrugsSheetSummary | null = null

  for (const config of SHEET_CONFIG) {
    const sheet = workbook.Sheets[config.sheetName]
    if (!sheet) {
      throw new Error(`Walang "${config.sheetName}" sheet sa workbook.`)
    }

    const parsed = parseSheet(sheet, config.sheetKey)
    if (config.sheetKey === "hvi") {
      hvi = parsed
    } else {
      sli = parsed
    }
  }

  if (!hvi && !sli) {
    throw new Error("Walang valid na summary rows sa HVI at SLI sheets.")
  }

  return { hvi, sli }
}
