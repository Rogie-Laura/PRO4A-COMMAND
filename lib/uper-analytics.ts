import { UPER_FOCUS_OFFICE } from "@/lib/uper-types"
import type {
  ParsedUperWorkbook,
  UperAnalytics,
  UperCurrentRanking,
  UperFocusTrendPoint,
  UperMonthSnapshot,
} from "@/lib/uper-types"

function formatShortMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
}

function findFocusRanking(month: UperMonthSnapshot) {
  return month.rankings.find((row) => row.office.toUpperCase() === UPER_FOCUS_OFFICE)
}

function buildTrend(months: UperMonthSnapshot[]): UperFocusTrendPoint[] {
  return months
    .map((month) => {
      const focus = findFocusRanking(month)
      if (!focus) return null

      return {
        monthKey: month.monthKey,
        monthLabel: month.monthLabel,
        shortLabel: formatShortMonthLabel(month.monthKey),
        rankNumber: focus.rankNumber,
        rankLabel: focus.rankLabel,
        points: focus.points,
        rating: focus.rating,
      }
    })
    .filter((point): point is UperFocusTrendPoint => point !== null)
}

function buildCurrentRanking(months: UperMonthSnapshot[]): UperCurrentRanking | null {
  const latestMonth = months.at(-1)
  if (!latestMonth) return null

  const focus = findFocusRanking(latestMonth)
  if (!focus) return null

  return {
    monthKey: latestMonth.monthKey,
    monthLabel: latestMonth.monthLabel,
    shortLabel: formatShortMonthLabel(latestMonth.monthKey),
    rankNumber: focus.rankNumber,
    rankLabel: focus.rankLabel,
    points: focus.points,
    rating: focus.rating,
    totalPros: latestMonth.rankings.length,
  }
}

export function emptyUperAnalytics(fileName = ""): UperAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    focusOffice: UPER_FOCUS_OFFICE,
    current: null,
    trend: [],
    months: [],
  }
}

export function buildUperAnalyticsFromWorkbook(
  workbook: ParsedUperWorkbook,
  meta: { fileName: string; lastUpdated: string },
): UperAnalytics {
  const trend = buildTrend(workbook.months)
  const current = buildCurrentRanking(workbook.months)

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: Boolean(current && trend.length > 0),
    focusOffice: UPER_FOCUS_OFFICE,
    current,
    trend,
    months: workbook.months,
  }
}
