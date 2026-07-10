export type CriminalGangsCountRow = {
  unit: string
  arrested: number
  surrendered: number
  dpo: number
  total: number
  isTotal: boolean
}

export type CriminalGangsGroupSummary = {
  groupKey: "drug" | "gunForHire" | "otherCriminal"
  label: string
  arrested: number
  surrendered: number
  dpo: number
  total: number
  unitRows: CriminalGangsCountRow[]
}

export type CriminalGangsOverview = {
  grandTotal: number
  drugTotal: number
  gunForHireTotal: number
  otherCriminalTotal: number
  unitRows: Array<{
    unit: string
    grandTotal: number
    isTotal: boolean
  }>
}

export type CriminalGangsAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  title: string
  periodLabel: string
  overview: CriminalGangsOverview | null
  drugGroups: CriminalGangsGroupSummary | null
  gunForHireGroups: CriminalGangsGroupSummary | null
  otherCriminalGroups: CriminalGangsGroupSummary | null
}

export type CriminalGangsUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedCriminalGangsWorkbook = {
  title: string
  periodLabel: string
  overview: CriminalGangsOverview
  drugGroups: CriminalGangsGroupSummary
  gunForHireGroups: CriminalGangsGroupSummary
  otherCriminalGroups: CriminalGangsGroupSummary
}
