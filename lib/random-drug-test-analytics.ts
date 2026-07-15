import type {
  ParsedRandomDrugTestWorkbook,
  RandomDrugTestAnalytics,
} from "@/lib/random-drug-test-types"

export function emptyRandomDrugTestAnalytics(fileName = ""): RandomDrugTestAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    title: "Random Drug Test",
    periodLabel: "",
    note: "",
    rows: [],
  }
}

export function buildRandomDrugTestAnalyticsFromWorkbook(
  workbook: ParsedRandomDrugTestWorkbook,
  meta: { fileName: string; lastUpdated: string },
): RandomDrugTestAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.rows.length > 0,
    title: workbook.title || "Random Drug Test",
    periodLabel: workbook.periodLabel,
    note: workbook.note,
    rows: workbook.rows,
  }
}

export function getRandomDrugTestGrandTotal(rows: RandomDrugTestAnalytics["rows"]) {
  return rows.find((row) => row.isTotal) ?? null
}
