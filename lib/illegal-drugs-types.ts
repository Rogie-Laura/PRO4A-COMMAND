export type IllegalDrugsPpoRow = {
  ppo: string
  arrested: number
  surrendered: number
  dpo: number
  total: number
  isTotal: boolean
}

export type IllegalDrugsSheetSummary = {
  sheetKey: "hvi" | "sli"
  title: string
  periodLabel: string
  note: string
  breakdownAsOf: string
  rows: IllegalDrugsPpoRow[]
}

export type IllegalDrugsAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  hvi: IllegalDrugsSheetSummary | null
  sli: IllegalDrugsSheetSummary | null
}

export type IllegalDrugsUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedIllegalDrugsWorkbook = {
  hvi: IllegalDrugsSheetSummary | null
  sli: IllegalDrugsSheetSummary | null
}
