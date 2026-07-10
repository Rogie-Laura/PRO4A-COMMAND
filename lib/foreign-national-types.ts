export const FOREIGN_NATIONAL_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const

export type ForeignNationalMonth = (typeof FOREIGN_NATIONAL_MONTHS)[number]

export type ForeignNationalMonthlyCounts = Record<ForeignNationalMonth, number>

export type ForeignNationalPpoRow = {
  ppo: string
  months: ForeignNationalMonthlyCounts
  rowTotal: number
  isSubTotal: boolean
}

export type ForeignNationalAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  title: string
  note: string
  months: ForeignNationalMonth[]
  rows: ForeignNationalPpoRow[]
  grandTotal: number
}

export type ForeignNationalUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedForeignNationalWorkbook = {
  title: string
  note: string
  months: ForeignNationalMonth[]
  rows: ForeignNationalPpoRow[]
  grandTotal: number
}
