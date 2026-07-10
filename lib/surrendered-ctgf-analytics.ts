import type {
  ParsedSurrenderedCtgfWorkbook,
  SurrenderedCtgfAnalytics,
} from "@/lib/surrendered-ctgf-types"

export function emptySurrenderedCtgfAnalytics(fileName = ""): SurrenderedCtgfAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    title: "SURRENDERED CTGs and FAs",
    periodLabel: "",
    note: "",
    rows: [],
  }
}

export function buildSurrenderedCtgfAnalyticsFromWorkbook(
  workbook: ParsedSurrenderedCtgfWorkbook,
  meta: { fileName: string; lastUpdated: string },
): SurrenderedCtgfAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.rows.length > 0,
    title: workbook.title,
    periodLabel: workbook.periodLabel,
    note: workbook.note,
    rows: workbook.rows,
  }
}
