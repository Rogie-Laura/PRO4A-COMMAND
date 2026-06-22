/** RTAP 2026 — Regional Training Action Plan accomplishment monitoring. */
export const TRAININGS_SHEET = {
  sheetId: "1hzNo4NcRWQejtBS6DMUWVfkE1DZmpgTb",
  gid: "1708033472",
  label: "RTAP 2026 Accomplishment Monitoring",
  programYear: "RTAP CY 2026",
} as const

export function getTrainingsCsvUrl() {
  const sheetId = process.env.GOOGLE_TRAININGS_SHEET_ID ?? TRAININGS_SHEET.sheetId
  const gid = process.env.GOOGLE_TRAININGS_SHEET_GID ?? TRAININGS_SHEET.gid

  // Use native CSV export — gviz/tq reshapes this workbook and breaks column parsing.
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}
