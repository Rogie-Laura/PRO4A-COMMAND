const DEFAULT_SHEET_ID = "1lUUHErp9LEfCQ2D6CDjC8LfH1WeXf8PG"
const DEFAULT_MOBILITY_TAB = "Mobility"
const PERSONNEL_COLUMNS = "A, B, C, D, F, G, I, K, N, R, T, V, Y"
const MOBILITY_VEHICLE_COLUMNS =
  "Sub Unit, Station, Plate Number, Vehicle Type, Ownership, Condition, Status"
const SHEET_CACHE_SECONDS = 600
const MOBILITY_PROBE_LIMIT = 10
/** PRO4A BMI source: RICTMD tab only. */
export const DEFAULT_HEALTH_SHEET_ID = "1YKb4nj2IHXl2DdmN7Yvya4lru5j3agdQ"
export const DEFAULT_HEALTH_GID = "1414294567"
const HEALTH_RICTMD_BMI_COLUMNS = "P, Q"

function buildSheetCsvUrl(
  sheetId: string,
  options?: {
    sheetTab?: string
    gid?: string
    query?: string
  },
) {
  const params = new URLSearchParams({
    tqx: "out:csv",
    headers: "1",
  })

  if (options?.gid) {
    params.set("gid", options.gid)
  } else if (options?.sheetTab) {
    params.set("sheet", options.sheetTab)
  }

  if (options?.query) {
    params.set("tq", options.query)
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`
}

export function getPersonnelSheetCsvUrl(sheetId?: string) {
  const id = sheetId ?? process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID
  return buildSheetCsvUrl(id, {
    query: `SELECT ${PERSONNEL_COLUMNS}`,
  })
}

/** @deprecated Use getPersonnelSheetCsvUrl instead. */
export function getSheetCsvUrl(sheetId?: string) {
  return getPersonnelSheetCsvUrl(sheetId)
}

function getMobilitySheetConfig(options?: {
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
  const gid = options?.gid ?? process.env.GOOGLE_MOBILITY_SHEET_GID

  return { id, tab, gid }
}

export function getMobilityProbeCsvUrl(options?: {
  sheetId?: string
  sheetTab?: string
  gid?: string
}) {
  const { id, tab, gid } = getMobilitySheetConfig(options)

  return buildSheetCsvUrl(id, {
    sheetTab: gid ? undefined : tab,
    gid,
    query: `SELECT * LIMIT ${MOBILITY_PROBE_LIMIT}`,
  })
}

export function getMobilitySheetCsvUrl(options?: {
  sheetId?: string
  sheetTab?: string
  gid?: string
}) {
  const { id, tab, gid } = getMobilitySheetConfig(options)

  return buildSheetCsvUrl(id, {
    sheetTab: gid ? undefined : tab,
    gid,
    query: `SELECT ${MOBILITY_VEHICLE_COLUMNS}`,
  })
}

export async function fetchPersonnelSheetCsv(sheetId?: string): Promise<string> {
  return fetchCsv(getPersonnelSheetCsvUrl(sheetId), SHEET_CACHE_SECONDS)
}

/** @deprecated Use fetchPersonnelSheetCsv instead. */
export async function fetchSheetCsv(sheetId?: string): Promise<string> {
  return fetchPersonnelSheetCsv(sheetId)
}

export async function fetchMobilityProbeCsv(options?: {
  sheetId?: string
  sheetTab?: string
  gid?: string
}): Promise<string> {
  return fetchCsv(getMobilityProbeCsvUrl(options), SHEET_CACHE_SECONDS)
}

export async function fetchMobilitySheetCsv(options?: {
  sheetId?: string
  sheetTab?: string
  gid?: string
}): Promise<string> {
  return fetchCsv(getMobilitySheetCsvUrl(options), SHEET_CACHE_SECONDS)
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
  return fetchCsv(getHealthSheetCsvUrl(options), SHEET_CACHE_SECONDS)
}

async function fetchCsv(url: string, revalidateSeconds = SHEET_CACHE_SECONDS): Promise<string> {
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
