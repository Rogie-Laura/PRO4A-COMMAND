import type {
  ParsedTerrorismThreatWorkbook,
  TerrorismThreatAnalytics,
} from "@/lib/terrorism-threat-types"

export function emptyTerrorismThreatAnalytics(fileName = ""): TerrorismThreatAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    periodLabel: "",
    rows: [],
    note: "",
  }
}

export function buildTerrorismThreatAnalyticsFromWorkbook(
  workbook: ParsedTerrorismThreatWorkbook,
  meta: { fileName: string; lastUpdated: string },
): TerrorismThreatAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.rows.length > 0,
    periodLabel: workbook.periodLabel,
    rows: workbook.rows,
    note: workbook.note,
  }
}
