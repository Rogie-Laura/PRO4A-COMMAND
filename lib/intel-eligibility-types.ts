export type IntelEligibilityStrength = {
  pco: number
  pnco: number
  nup: number
  total: number
}

export type IntelEligibilityMetricKey =
  | "authorized"
  | "actual"
  | "withTraining"
  | "withSeminar"
  | "withoutTrainingSeminar"
  | "trainingNotInPosition"

export type IntelEligibilityUnitRow = {
  unit: string
  authorized: IntelEligibilityStrength
  actual: IntelEligibilityStrength
  withTraining: IntelEligibilityStrength
  withSeminar: IntelEligibilityStrength
  withoutTrainingSeminar: IntelEligibilityStrength
  trainingNotInPosition: IntelEligibilityStrength
  isTotal: boolean
}

export type IntelEligibilityMetricSummary = {
  key: IntelEligibilityMetricKey
  label: string
  shortLabel: string
  totals: IntelEligibilityStrength
  unitRows: IntelEligibilityUnitRow[]
}

export type IntelEligibilityAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  title: string
  periodLabel: string
  note: string
  units: IntelEligibilityUnitRow[]
  metrics: IntelEligibilityMetricSummary[]
}

export type IntelEligibilityUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedIntelEligibilityWorkbook = {
  title: string
  periodLabel: string
  note: string
  units: IntelEligibilityUnitRow[]
}
