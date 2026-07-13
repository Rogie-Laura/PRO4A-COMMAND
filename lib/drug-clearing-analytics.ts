import type {
  DrugClearingAnalytics,
  ParsedDrugClearingWorkbook,
} from "@/lib/drug-clearing-types"

export function emptyDrugClearingAnalytics(fileName = ""): DrugClearingAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    recap: [],
    provinces: [],
  }
}

export function buildDrugClearingAnalyticsFromWorkbook(
  workbook: ParsedDrugClearingWorkbook,
  meta: { fileName: string; lastUpdated: string },
): DrugClearingAnalytics {
  if (workbook.recap.length === 0 || workbook.provinces.length === 0) {
    return emptyDrugClearingAnalytics(meta.fileName)
  }

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: true,
    recap: workbook.recap,
    provinces: workbook.provinces,
  }
}

export function getDrugClearingRegionalTotal(recap: DrugClearingAnalytics["recap"]) {
  return recap.find((row) => row.isTotal) ?? null
}
