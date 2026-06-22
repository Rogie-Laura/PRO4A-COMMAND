import { getAdminHoldingCsvUrl, ADMIN_HOLDING_SHEET } from "@/lib/admin-holding-sheet"
import { getIctEquipmentCsvUrl, ICT_EQUIPMENT_SHEET } from "@/lib/ict-equipment-sheet"
import { getRictmdBmiCsvUrl, RICTMD_BMI_SHEET } from "@/lib/rictmd-bmi-sheet"
import { PERSONNEL_RECAP_SHEET } from "@/lib/personnel-recap-sheet"
import { getTrainingsCsvUrl, TRAININGS_SHEET } from "@/lib/trainings-sheet"
import {
  getDetailedPersonnelCsvUrl,
  DETAILED_PERSONNEL_SHEET,
} from "@/lib/detailed-personnel-sheet"
import type { DetailedPersonnelTabKey } from "@/lib/detailed-personnel-types"
import {
  getSchoolingMandatoryCsvUrl,
  getSchoolingSpecializedCsvUrl,
  SCHOOLING_SHEET,
} from "@/lib/schooling-sheet"

export {
  ICT_EQUIPMENT_SHEET,
  RICTMD_BMI_SHEET,
  PERSONNEL_RECAP_SHEET,
  ADMIN_HOLDING_SHEET,
  TRAININGS_SHEET,
  SCHOOLING_SHEET,
  DETAILED_PERSONNEL_SHEET,
}

const DEFAULT_SHEET_ID = "1B0-dkbSxcdmEygDVxz_0tthLz9vFBqax9Fq8WUtoPQk"
const DEFAULT_MOBILITY_TAB = "Mobility"
const PERSONNEL_COLUMNS = "A, B, C, D, F, G, I, K, N, R, T, V, Y"
const MOBILITY_VEHICLE_COLUMNS =
  "Sub Unit, Station, Plate Number, Vehicle Type, Ownership, Condition, Status"
const SHEET_CACHE_SECONDS = 600
const MOBILITY_PROBE_LIMIT = 10

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

export function getPersonnelRecapCsvUrl(sheetId?: string) {
  const id = sheetId ?? process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID
  // Use raw /export?format=csv URL — gviz/tq type-infers the Value column as
  // numeric (first rows are numbers) and drops all string values like the
  // pipe-delimited "rank|name|0" leadership entries.
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${PERSONNEL_RECAP_SHEET.gid}`
}

export async function fetchPersonnelRecapCsv(sheetId?: string): Promise<string> {
  return fetchCsv(getPersonnelRecapCsvUrl(sheetId), SHEET_CACHE_SECONDS)
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

export function getHealthSheetCsvUrl() {
  return getRictmdBmiCsvUrl()
}

export async function fetchRictmdBmiSheetCsv(): Promise<string> {
  return fetchCsv(getRictmdBmiCsvUrl(), SHEET_CACHE_SECONDS)
}

export async function fetchIctEquipmentSheetCsv(): Promise<string> {
  return fetchCsv(getIctEquipmentCsvUrl(), SHEET_CACHE_SECONDS)
}

export async function fetchAdminHoldingSheetCsv(): Promise<string> {
  return fetchCsv(getAdminHoldingCsvUrl(), SHEET_CACHE_SECONDS)
}

export async function fetchTrainingsSheetCsv(): Promise<string> {
  return fetchCsv(getTrainingsCsvUrl(), SHEET_CACHE_SECONDS)
}

export async function fetchSchoolingMandatorySheetCsv(): Promise<string> {
  return fetchCsv(getSchoolingMandatoryCsvUrl(), SHEET_CACHE_SECONDS)
}

export async function fetchSchoolingSpecializedSheetCsv(): Promise<string> {
  return fetchCsv(getSchoolingSpecializedCsvUrl(), SHEET_CACHE_SECONDS)
}

export async function fetchDetailedPersonnelSheetCsv(
  tab: DetailedPersonnelTabKey,
): Promise<string> {
  return fetchCsv(getDetailedPersonnelCsvUrl(tab), SHEET_CACHE_SECONDS)
}

/** @deprecated Use fetchRictmdBmiSheetCsv instead. */
export async function fetchHealthSheetCsv(): Promise<string> {
  return fetchRictmdBmiSheetCsv()
}

const FETCH_TIMEOUT_MS = 25000

async function fetchCsv(url: string, revalidateSeconds = SHEET_CACHE_SECONDS): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet (${response.status})`)
    }

    return await response.text()
  } finally {
    clearTimeout(timer)
  }
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

export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim())
      current = ""
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++
      }

      row.push(current.trim())
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row)
      }
      row = []
      current = ""
    } else {
      current += char
    }
  }

  row.push(current.trim())
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row)
  }

  return rows
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text)
  if (rows.length < 2) return []

  const headers = rows[0]
  return rows.slice(1).map((values) => {
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() ?? ""
    })

    return row
  })
}
