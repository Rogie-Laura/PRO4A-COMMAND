/** RTAP 2026 — Regional Training Action Plan accomplishment monitoring. */
export const TRAININGS_SHEET = {
  sheetId: "13AzAAC2P1fZRKON5rFtwuySjIvm9JgDS",
  label: "RTAP 2026 Accomplishment Monitoring",
  programYear: "RTAP CY 2026",
} as const

export function getTrainingsCsvUrl() {
  const sheetId = process.env.GOOGLE_TRAININGS_SHEET_ID ?? TRAININGS_SHEET.sheetId

  const params = new URLSearchParams({
    tqx: "out:csv",
  })

  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`
}
