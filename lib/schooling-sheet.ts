/** Personnel workbook — Schooling tabs. */
export const SCHOOLING_SHEET = {
  sheetId: "1B0-dkbSxcdmEygDVxz_0tthLz9vFBqax9Fq8WUtoPQk",
  mandatoryGid: "418850451",
  specializedGid: "70235906",
  mandatoryLabel: "Schooling Mandatory",
  specializedLabel: "Schooling Specialized",
} as const

export function getSchoolingMandatoryCsvUrl() {
  const sheetId = process.env.GOOGLE_SHEET_ID ?? SCHOOLING_SHEET.sheetId
  const gid = process.env.GOOGLE_SCHOOLING_MANDATORY_GID ?? SCHOOLING_SHEET.mandatoryGid

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}

export function getSchoolingSpecializedCsvUrl() {
  const sheetId = process.env.GOOGLE_SHEET_ID ?? SCHOOLING_SHEET.sheetId
  const gid = process.env.GOOGLE_SCHOOLING_SPECIALIZED_GID ?? SCHOOLING_SHEET.specializedGid

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}
