import type {
  CriminalGangsAnalytics,
  ParsedCriminalGangsWorkbook,
} from "@/lib/criminal-gangs-types"

export function emptyCriminalGangsAnalytics(fileName = ""): CriminalGangsAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    title: "ACCOMPLISHMENTS ON CRIMINAL GANGS",
    periodLabel: "",
    overview: null,
    drugGroups: null,
    gunForHireGroups: null,
    otherCriminalGroups: null,
  }
}

export function buildCriminalGangsAnalyticsFromWorkbook(
  workbook: ParsedCriminalGangsWorkbook,
  meta: { fileName: string; lastUpdated: string },
): CriminalGangsAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: true,
    title: workbook.title,
    periodLabel: workbook.periodLabel,
    overview: workbook.overview,
    drugGroups: workbook.drugGroups,
    gunForHireGroups: workbook.gunForHireGroups,
    otherCriminalGroups: workbook.otherCriminalGroups,
  }
}
