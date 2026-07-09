import * as XLSX from "xlsx"

import type {
  LegislativeAgendaItem,
  ParsedLegislativeAgendaWorkbook,
} from "@/lib/legislative-agenda-types"

const LEGISLATIVE_AGENDA_SHEET = "Legislative Agenda"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function normalizeHeader(value: unknown) {
  return normalizeCell(value).toLowerCase()
}

function parseItemNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  const parsed = Number.parseInt(normalizeCell(value), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!Array.isArray(row)) continue

    const headers = row.map(normalizeHeader)
    const numberIndex = headers.findIndex((header) => header === "no." || header === "no")
    const measureIndex = headers.findIndex((header) =>
      header.includes("pnp priority legislative measures"),
    )
    const statusIndex = headers.indexOf("status")

    if (numberIndex >= 0 && measureIndex >= 0 && statusIndex >= 0) {
      return {
        headerRowIndex: index,
        columnIndex: {
          number: numberIndex,
          measure: measureIndex,
          status: statusIndex,
        },
      }
    }
  }

  return null
}

function findReference(rows: unknown[][]) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue

    for (const cell of row) {
      const text = normalizeCell(cell)
      if (/^reference:/i.test(text)) {
        return text
      }
    }
  }

  return ""
}

function parseItems(rows: unknown[][], header: NonNullable<ReturnType<typeof findHeaderRow>>) {
  const items: LegislativeAgendaItem[] = []

  for (const row of rows.slice(header.headerRowIndex + 1)) {
    if (!Array.isArray(row)) continue

    const number = parseItemNumber(row[header.columnIndex.number])
    const measure = normalizeCell(row[header.columnIndex.measure])
    const status = normalizeCell(row[header.columnIndex.status])

    if (number == null || !measure) continue
    if (/^reference:/i.test(measure)) break

    items.push({ number, measure, status })
  }

  return items
}

export function parseLegislativeAgendaXlsx(buffer: ArrayBuffer | Buffer): ParsedLegislativeAgendaWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheet = workbook.Sheets[LEGISLATIVE_AGENDA_SHEET]

  if (!sheet) {
    throw new Error(`Walang "${LEGISLATIVE_AGENDA_SHEET}" sheet sa workbook.`)
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const header = findHeaderRow(rows)
  if (!header) {
    throw new Error(
      'Hindi mahanap ang Legislative Agenda table. Dapat may No., PNP Priority Legislative Measures, at Status columns.',
    )
  }

  const items = parseItems(rows, header)
  const reference = findReference(rows)

  if (items.length === 0) {
    throw new Error("Walang legislative agenda items sa workbook.")
  }

  return { items, reference }
}
