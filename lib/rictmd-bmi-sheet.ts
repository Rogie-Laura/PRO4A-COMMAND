/** BMI records are sourced exclusively from the RICTMD tab. */
export const RICTMD_BMI_SHEET = {
  sheetId: "1YKb4nj2IHXl2DdmN7Yvya4lru5j3agdQ",
  gid: "1414294567",
  tabName: "RICTMD",
  label: "RICTMD",
} as const

const RICTMD_BMI_COLUMNS = "P, Q"

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
  return headers.has("BMI") && headers.has("BMI Category")
}
