export type LegislativeAgendaItem = {
  number: number
  measure: string
  status: string
}

export type LegislativeAgendaAnalytics = {
  lastUpdated: string
  fileName: string
  dataReady: boolean
  items: LegislativeAgendaItem[]
  reference: string
}

export type LegislativeAgendaUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}

export type ParsedLegislativeAgendaWorkbook = {
  items: LegislativeAgendaItem[]
  reference: string
}
