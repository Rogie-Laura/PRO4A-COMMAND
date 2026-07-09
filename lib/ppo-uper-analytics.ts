import type {
  ParsedPpoUperWorkbook,
  PpoUperAnalytics,
  PpoUperMonthSnapshot,
  PpoUperRow,
  PpoUperTrendPoint,
  PpoUperTrendSeries,
} from "@/lib/ppo-uper-types"

function formatShortMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
}

function normalizePpoKey(ppo: string) {
  return ppo.trim().replace(/\s+/g, " ")
}

function findPpoRow(month: PpoUperMonthSnapshot, ppo: string) {
  const key = normalizePpoKey(ppo)
  return month.rows.find((row) => normalizePpoKey(row.ppo) === key) ?? null
}

function buildTrendByPpo(months: PpoUperMonthSnapshot[]): PpoUperTrendSeries[] {
  const ppoNames = new Set<string>()

  for (const month of months) {
    for (const row of month.rows) {
      ppoNames.add(normalizePpoKey(row.ppo))
    }
  }

  return [...ppoNames]
    .sort((left, right) => left.localeCompare(right))
    .map((ppo) => {
      const points: PpoUperTrendPoint[] = months
        .map((month) => {
          const row = findPpoRow(month, ppo)
          if (!row) return null

          return {
            monthKey: month.monthKey,
            monthLabel: month.monthLabel,
            shortLabel: formatShortMonthLabel(month.monthKey),
            totalPoints: row.totalPoints,
            derivedRank: row.derivedRank,
            derivedRankLabel: row.derivedRankLabel,
            rating: row.rating,
          }
        })
        .filter((point): point is PpoUperTrendPoint => point !== null)

      return { ppo, points }
    })
}

function getLatestRankings(months: PpoUperMonthSnapshot[]): PpoUperRow[] {
  const latestMonth = months.at(-1)
  if (!latestMonth) return []

  return [...latestMonth.rows].sort((left, right) => left.derivedRank - right.derivedRank)
}

export function emptyPpoUperAnalytics(fileName = ""): PpoUperAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    currentMonth: null,
    rankings: [],
    months: [],
    trendByPpo: [],
  }
}

export function buildPpoUperAnalyticsFromWorkbook(
  workbook: ParsedPpoUperWorkbook,
  meta: { fileName: string; lastUpdated: string },
): PpoUperAnalytics {
  const latestMonth = workbook.months.at(-1) ?? null
  const rankings = getLatestRankings(workbook.months)
  const trendByPpo = buildTrendByPpo(workbook.months)

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: Boolean(latestMonth && rankings.length > 0),
    currentMonth: latestMonth
      ? {
          monthKey: latestMonth.monthKey,
          monthLabel: latestMonth.monthLabel,
        }
      : null,
    rankings,
    months: workbook.months,
    trendByPpo,
  }
}
