/** PRO CALABARZON personnel roster — Alphalist tab on the RPRMD workbook. */
export const PERSONNEL_ROSTER_SHEET = {
  sheetId: "1B0-dkbSxcdmEygDVxz_0tthLz9vFBqax9Fq8WUtoPQk",
  gid: "1580239983",
  tabName: "Alphalist",
  label: "Alphalist",
} as const

export function getPersonnelRosterCsvUrl() {
  const sheetId = process.env.GOOGLE_SHEET_ID ?? PERSONNEL_ROSTER_SHEET.sheetId
  const gid = process.env.GOOGLE_PERSONNEL_ROSTER_GID ?? PERSONNEL_ROSTER_SHEET.gid

  // Native CSV export preserves all named columns for mapPersonnelRow().
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}
