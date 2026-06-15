/** RPHAS Data workbook — Admin Holding tab. */
export const ADMIN_HOLDING_SHEET = {
  sheetId: "1_T5SJjjw8WcOnJxev-wb_X6C2YJDi9ZX",
  tabName: "Admin Holding",
  label: "Admin Holding",
} as const

export function getAdminHoldingCsvUrl() {
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: ADMIN_HOLDING_SHEET.tabName,
  })

  const sheetId =
    process.env.GOOGLE_ADMIN_HOLDING_SHEET_ID ?? ADMIN_HOLDING_SHEET.sheetId

  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`
}
