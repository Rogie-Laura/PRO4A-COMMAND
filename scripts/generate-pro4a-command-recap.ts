import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { mapPersonnelRow } from "../lib/personnel-aggregations.ts"
import { buildPersonnelRecapRows, recapRowsToCsv } from "../lib/personnel-recap-builder.ts"
import { PERSONNEL_RECAP_SHEET } from "../lib/personnel-recap-sheet.ts"

const SHEET_ID = PERSONNEL_RECAP_SHEET.sheetId
const PERSONNEL_COLUMNS = "A, B, C, D, F, G, I, K, N, R, T, V, Y"

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() ?? ""
    })
    return row
  })
}

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&tq=${encodeURIComponent(`SELECT ${PERSONNEL_COLUMNS}`)}`
const response = await fetch(url)

if (!response.ok) {
  throw new Error(`Failed to fetch personnel sheet (${response.status})`)
}

const csv = await response.text()
const records = parseCsv(csv).map(mapPersonnelRow).filter((row) => row.lastName || row.firstName)
const recapCsv = recapRowsToCsv(buildPersonnelRecapRows(records))
const outputPath = resolve("output", "PRO4A-COMMAND-recap.csv")

writeFileSync(outputPath, recapCsv, "utf8")

console.log(`Generated ${records.length.toLocaleString()} personnel recap rows.`)
console.log(`Saved: ${outputPath}`)
console.log("Import this into a new sheet tab named PRO4A-COMMAND, or run the Apps Script in scripts/google-apps-script-pro4a-command-recap.gs")
