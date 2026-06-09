const DEFAULT_SHEET_ID = "1lUUHErp9LEfCQ2D6CDjC8LfH1WeXf8PG"

export function getSheetCsvUrl(sheetId?: string) {
  const id = sheetId ?? process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID
  const columns = "A,B,C,D,F,I,N,R,T,V,Y"
  const query = encodeURIComponent(`SELECT ${columns.replace(/,/g, ", ")}`)
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&tq=${query}`
}

export async function fetchSheetCsv(sheetId?: string): Promise<string> {
  const url = getSheetCsvUrl(sheetId)
  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet (${response.status})`)
  }

  return response.text()
}

function parseCsvLine(line: string): string[] {
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

export function parseCsv(text: string): Record<string, string>[] {
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
