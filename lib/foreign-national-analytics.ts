import type {
  ForeignNationalAnalytics,
  ParsedForeignNationalWorkbook,
} from "@/lib/foreign-national-types"
import { FOREIGN_NATIONAL_MONTHS } from "@/lib/foreign-national-types"

export function emptyForeignNationalAnalytics(fileName = ""): ForeignNationalAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    title: "Incident Report Involving Foreign National",
    note: "",
    months: [...FOREIGN_NATIONAL_MONTHS],
    rows: [],
    grandTotal: 0,
  }
}

export function buildForeignNationalAnalyticsFromWorkbook(
  workbook: ParsedForeignNationalWorkbook,
  meta: { fileName: string; lastUpdated: string },
): ForeignNationalAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.rows.length > 0,
    title: workbook.title,
    note: workbook.note,
    months: workbook.months,
    rows: workbook.rows,
    grandTotal: workbook.grandTotal,
  }
}
