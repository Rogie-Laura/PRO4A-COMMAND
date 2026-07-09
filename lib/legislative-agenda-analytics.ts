import type {
  LegislativeAgendaAnalytics,
  ParsedLegislativeAgendaWorkbook,
} from "@/lib/legislative-agenda-types"

export function emptyLegislativeAgendaAnalytics(fileName = ""): LegislativeAgendaAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    items: [],
    reference: "",
  }
}

export function buildLegislativeAgendaAnalyticsFromWorkbook(
  workbook: ParsedLegislativeAgendaWorkbook,
  meta: { fileName: string; lastUpdated: string },
): LegislativeAgendaAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.items.length > 0,
    items: workbook.items,
    reference: workbook.reference,
  }
}
