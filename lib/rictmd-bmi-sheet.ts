/** BMI records are sourced exclusively from the RICTMD tab. */
export const RICTMD_BMI_SHEET = {
  sheetId: "1YKb4nj2IHXl2DdmN7Yvya4lru5j3agdQ",
  gid: "1414294567",
  tabName: "RICTMD",
  label: "RICTMD personnel",
} as const

const RICTMD_BMI_COLUMNS = "G, P, Q"
const RICTMD_OFFICE_FIELD = "Station/Office"
const RICTMD_OFFICE_VALUE = "RICTMD"

export function isRictmdPersonnelRow(row: Record<string, string>) {
  const office = row[RICTMD_OFFICE_FIELD]?.trim().toUpperCase()
  return office === RICTMD_OFFICE_VALUE
}

export function getRictmdBmiCsvUrl() {
  const params = new URLSearchParams({
    tqx: "out:csv",
    headers: "1",
    gid: RICTMD_BMI_SHEET.gid,
    tq: `SELECT ${RICTMD_BMI_COLUMNS.replace(/,/g, ", ")}`,
  })

  return `https://docs.google.com/spreadsheets/d/${RICTMD_BMI_SHEET.sheetId}/gviz/tq?${params.toString()}`
}

export function isRictmdBmiSheet(rows: Record<string, string>[]) {
  if (rows.length === 0) return false

  const headers = new Set(Object.keys(rows[0]).map((header) => header.trim()))
  return (
    headers.has(RICTMD_OFFICE_FIELD) &&
    headers.has("BMI") &&
    headers.has("BMI Category")
  )
}
