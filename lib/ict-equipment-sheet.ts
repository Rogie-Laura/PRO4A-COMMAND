/** ICT device inventory is sourced from the RECAP tab. */
export const ICT_EQUIPMENT_SHEET = {
  sheetId: "1x_sOfIoFvs5a7SMg4xM2Y6rXlAxmG7jjqlxR8A_agMc",
  gid: "933109512",
  tabName: "RECAP",
  label: "ICT Equipment Inventory",
} as const

export function getIctEquipmentCsvUrl() {
  const params = new URLSearchParams({
    tqx: "out:csv",
    headers: "1",
    gid: ICT_EQUIPMENT_SHEET.gid,
  })

  return `https://docs.google.com/spreadsheets/d/${ICT_EQUIPMENT_SHEET.sheetId}/gviz/tq?${params.toString()}`
}
