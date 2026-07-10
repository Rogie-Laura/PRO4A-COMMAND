import type {
  IllegalDrugsAnalytics,
  ParsedIllegalDrugsWorkbook,
} from "@/lib/illegal-drugs-types"

export function emptyIllegalDrugsAnalytics(fileName = ""): IllegalDrugsAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    hvi: null,
    sli: null,
  }
}

export function buildIllegalDrugsAnalyticsFromWorkbook(
  workbook: ParsedIllegalDrugsWorkbook,
  meta: { fileName: string; lastUpdated: string },
): IllegalDrugsAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: Boolean(workbook.hvi || workbook.sli),
    hvi: workbook.hvi,
    sli: workbook.sli,
  }
}
