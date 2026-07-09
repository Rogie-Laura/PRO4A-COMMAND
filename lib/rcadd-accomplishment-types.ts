export const RCADD_SECTION_IDS = [
  "rsri",
  "mobilized_barangays",
  "drug_cleared_barangays",
  "project_lakas",
] as const

export type RcaddSectionId = (typeof RCADD_SECTION_IDS)[number]

export type RcaddValueFormat = "percent" | "count"

export type RcaddMetric = {
  sectionId: RcaddSectionId
  sectionTitle: string
  metricKey: string
  label: string
  channel?: string
  period?: string
  value: number
  valueFormat: RcaddValueFormat
  unit?: string
}

export type RcaddAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  metrics: RcaddMetric[]
}

export type RcaddUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedRcaddWorkbook = {
  metrics: RcaddMetric[]
}

export const RCADD_SECTION_TITLES: Record<RcaddSectionId, string> = {
  rsri: "Regional Satisfaction & Respect Index",
  mobilized_barangays: "Certified Mobilized Barangays",
  drug_cleared_barangays: "Drug Cleared Barangays",
  project_lakas: "Rape Prevention Initiative: Project L.A.K.A.S",
}
