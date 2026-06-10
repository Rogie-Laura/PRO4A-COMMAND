const DEFAULT_SHEET_ID = "1lUUHErp9LEfCQ2D6CDjC8LfH1WeXf8PG"
const DEFAULT_MOBILITY_TAB = "Mobility"
/** PRO4A BMI source: RICTMD tab only. */
export const DEFAULT_HEALTH_SHEET_ID = "1YKb4nj2IHXl2DdmN7Yvya4lru5j3agdQ"
export const DEFAULT_HEALTH_GID = "1414294567"
const HEALTH_RICTMD_BMI_COLUMNS = "P, Q"
const HEALTH_CACHE_SECONDS = 600

export function getSheetCsvUrl(sheetId?: string) {
  const id = sheetId ?? process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID
  const columns = "A,B,C,D,F,G,I,K,N,R,T,V,Y"
  const query = encodeURIComponent(`SELECT ${columns.replace(/,/g, ", ")}`)
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&tq=${query}`
}

export function getMobilitySheetCsvUrl(options?: {
  sheetId?: string
  sheetTab?: string
  gid?: string
}) {
  const id =
    options?.sheetId ??
    process.env.GOOGLE_MOBILITY_SHEET_ID ??
    process.env.GOOGLE_SHEET_ID ??
    DEFAULT_SHEET_ID
  const tab =
    options?.sheetTab ??
    process.env.GOOGLE_MOBILITY_SHEET_TAB ??
    DEFAULT_MOBILITY_TAB

  const params = new URLSearchParams({
    tqx: "out:csv",
    headers: "1",
  })

  if (options?.gid) {
    params.set("gid", options.gid)
  } else {
    params.set("sheet", tab)
  }

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`
}

export async function fetchSheetCsv(sheetId?: string): Promise<string> {
  return fetchCsv(getSheetCsvUrl(sheetId))
}

export async function fetchMobilitySheetCsv(options?: {
  sheetId?: string
  sheetTab?: string
  gid?: string
}): Promise<string> {
  return fetchCsv(getMobilitySheetCsvUrl(options))
}

export function getHealthSheetCsvUrl(options?: {
  sheetId?: string
  gid?: string
}) {
  const id =
    options?.sheetId ??
    process.env.GOOGLE_HEALTH_SHEET_ID ??
    DEFAULT_HEALTH_SHEET_ID
  const gid = options?.gid ?? process.env.GOOGLE_HEALTH_SHEET_GID ?? DEFAULT_HEALTH_GID

  const params = new URLSearchParams({
    tqx: "out:csv",
    headers: "1",
    gid,
    tq: `SELECT ${HEALTH_RICTMD_BMI_COLUMNS.replace(/,/g, ", ")}`,
  })

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`
}

export async function fetchHealthSheetCsv(options?: {
  sheetId?: string
  gid?: string
}): Promise<string> {
  return fetchCsv(getHealthSheetCsvUrl(options), HEALTH_CACHE_SECONDS)
}

async function fetchCsv(url: string, revalidateSeconds = 300): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate: revalidateSeconds },
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
