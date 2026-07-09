import type {
  ParsedStationClassificationWorkbook,
  StationClassificationAnalytics,
} from "@/lib/station-classification-types"

export function emptyStationClassificationAnalytics(fileName = ""): StationClassificationAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    asOfLabel: "",
    ppoRows: [],
    totals: null,
    groups: [],
    pmfcUnits: [],
  }
}

export function buildStationClassificationAnalyticsFromWorkbook(
  workbook: ParsedStationClassificationWorkbook,
  meta: { fileName: string; lastUpdated: string },
): StationClassificationAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.ppoRows.length > 0 && workbook.groups.length > 0,
    asOfLabel: workbook.asOfLabel,
    ppoRows: workbook.ppoRows,
    totals: workbook.totals,
    groups: workbook.groups,
    pmfcUnits: workbook.pmfcUnits,
  }
}
