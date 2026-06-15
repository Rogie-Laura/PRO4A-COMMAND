/** Hybrid recap tab on the main personnel Google Sheet. */
export const PERSONNEL_RECAP_SHEET = {
  sheetId: "1lUUHErp9LEfCQ2D6CDjC8LfH1WeXf8PG",
  tabName: "PRO4A-COMMAND",
  label: "PRO4A-COMMAND recap",
} as const

export const PERSONNEL_RECAP_HEADERS = ["Section", "Key1", "Key2", "Key3", "Value"] as const

export const PERSONNEL_RECAP_SECTIONS = {
  meta: "meta",
  kpi: "kpi",
  workforce: "workforce",
  workforceGender: "workforce_gender",
  status: "status",
  rankPco: "rank_pco",
  rankPnco: "rank_pnco",
  office: "office",
  officeActive: "office_active",
  station: "station",
  age: "age",
  rankTenure: "rank_tenure",
  rankTenurePerson: "rank_tenure_person",
  leadership: "leadership",
  unitCount: "unit_count",
  unitActive: "unit_active",
} as const
