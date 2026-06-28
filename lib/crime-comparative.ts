import {
  endOfMonthFromMonthKey,
  formatCrimeDateRangeLabel,
  startOfDay,
  toIsoDateString,
} from "@/lib/crime-dates"
import type { CountItem } from "@/lib/personnel-types"

export type CrimePeriodRange = {
  start: string
  end: string
  label: string
}

export type CrimePeriodSnapshot = CrimePeriodRange & {
  totalVolume: number
  ppoBreakdown: CountItem[]
}

export type CrimeComparativeResult = {
  periodA: CrimePeriodSnapshot
  periodB: CrimePeriodSnapshot
  change: number
  changePct: number | null
  direction: "up" | "down" | "flat"
}

export type ComparativePresetId =
  | "month-vs-last-month"
  | "last-30-vs-prev-30"
  | "quarter-vs-last-quarter"
  | "year-to-date-vs-last-year"
  | "custom"

export type ComparativePreset = {
  id: ComparativePresetId
  label: string
  description: string
}

export const COMPARATIVE_PRESETS: ComparativePreset[] = [
  {
    id: "month-vs-last-month",
    label: "This month vs last month",
    description: "Buong buwan ngayon kumpara sa nakaraang buwan",
  },
  {
    id: "last-30-vs-prev-30",
    label: "Last 30 days vs previous 30",
    description: "Rolling 30 araw kumpara sa naunang 30 araw",
  },
  {
    id: "quarter-vs-last-quarter",
    label: "This quarter vs last quarter",
    description: "Kasalukuyang quarter kumpara sa nakaraang quarter",
  },
  {
    id: "year-to-date-vs-last-year",
    label: "YTD vs same period last year",
    description: "Year-to-date ngayon kumpara sa parehong span noong nakaraang taon",
  },
  {
    id: "custom",
    label: "Custom date range",
    description: "Piliin ang sariling start at end date para sa Period A at B",
  },
]

function clampRange(start: Date, end: Date, bounds?: { min: string; max: string } | null) {
  let nextStart = startOfDay(start)
  let nextEnd = startOfDay(end)

  if (nextStart > nextEnd) {
    ;[nextStart, nextEnd] = [nextEnd, nextStart]
  }

  if (bounds) {
    const minDate = startOfDay(new Date(`${bounds.min}T00:00:00`))
    const maxDate = startOfDay(new Date(`${bounds.max}T00:00:00`))
    if (nextStart < minDate) nextStart = minDate
    if (nextEnd > maxDate) nextEnd = maxDate
  }

  return {
    start: toIsoDateString(nextStart),
    end: toIsoDateString(nextEnd),
  }
}

function getQuarterStart(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), quarter * 3, 1)
}

function getQuarterEnd(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), quarter * 3 + 3, 0)
}

export function getDataDateBounds(monthlyBreakdown: { monthKey: string }[]) {
  if (monthlyBreakdown.length === 0) return null

  const first = monthlyBreakdown[0]?.monthKey
  const last = monthlyBreakdown[monthlyBreakdown.length - 1]?.monthKey
  if (!first || !last) return null

  return {
    min: `${first}-01`,
    max: endOfMonthFromMonthKey(last),
  }
}

export function buildPresetRanges(
  presetId: ComparativePresetId,
  bounds?: { min: string; max: string } | null,
  referenceDate = new Date(),
): { periodA: CrimePeriodRange; periodB: CrimePeriodRange } {
  const today = startOfDay(referenceDate)

  if (presetId === "month-vs-last-month") {
    const periodAStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const periodAEnd = today
    const periodBStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const periodBEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    const periodA = clampRange(periodAStart, periodAEnd, bounds)
    const periodB = clampRange(periodBStart, periodBEnd, bounds)

    return {
      periodA: {
        ...periodA,
        label: formatCrimeDateRangeLabel(periodA.start, periodA.end),
      },
      periodB: {
        ...periodB,
        label: formatCrimeDateRangeLabel(periodB.start, periodB.end),
      },
    }
  }

  if (presetId === "last-30-vs-prev-30") {
    const periodAEnd = today
    const periodAStart = new Date(today)
    periodAStart.setDate(periodAStart.getDate() - 29)

    const periodBEnd = new Date(periodAStart)
    periodBEnd.setDate(periodBEnd.getDate() - 1)
    const periodBStart = new Date(periodBEnd)
    periodBStart.setDate(periodBStart.getDate() - 29)

    const periodA = clampRange(periodAStart, periodAEnd, bounds)
    const periodB = clampRange(periodBStart, periodBEnd, bounds)

    return {
      periodA: {
        ...periodA,
        label: formatCrimeDateRangeLabel(periodA.start, periodA.end),
      },
      periodB: {
        ...periodB,
        label: formatCrimeDateRangeLabel(periodB.start, periodB.end),
      },
    }
  }

  if (presetId === "quarter-vs-last-quarter") {
    const periodAStart = getQuarterStart(today)
    const periodAEnd = today
    const previousQuarterEnd = new Date(periodAStart)
    previousQuarterEnd.setDate(previousQuarterEnd.getDate() - 1)
    const periodBStart = getQuarterStart(previousQuarterEnd)
    const periodBEnd = getQuarterEnd(previousQuarterEnd)

    const periodA = clampRange(periodAStart, periodAEnd, bounds)
    const periodB = clampRange(periodBStart, periodBEnd, bounds)

    return {
      periodA: {
        ...periodA,
        label: formatCrimeDateRangeLabel(periodA.start, periodA.end),
      },
      periodB: {
        ...periodB,
        label: formatCrimeDateRangeLabel(periodB.start, periodB.end),
      },
    }
  }

  if (presetId === "year-to-date-vs-last-year") {
    const periodAStart = new Date(today.getFullYear(), 0, 1)
    const periodAEnd = today
    const periodBStart = new Date(today.getFullYear() - 1, 0, 1)
    const periodBEnd = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

    const periodA = clampRange(periodAStart, periodAEnd, bounds)
    const periodB = clampRange(periodBStart, periodBEnd, bounds)

    return {
      periodA: {
        ...periodA,
        label: formatCrimeDateRangeLabel(periodA.start, periodA.end),
      },
      periodB: {
        ...periodB,
        label: formatCrimeDateRangeLabel(periodB.start, periodB.end),
      },
    }
  }

  const fallbackEnd = bounds?.max ?? toIsoDateString(today)
  const fallbackStart = bounds?.min ?? toIsoDateString(new Date(today.getFullYear(), today.getMonth(), 1))

  return {
    periodA: {
      start: fallbackStart,
      end: fallbackEnd,
      label: formatCrimeDateRangeLabel(fallbackStart, fallbackEnd),
    },
    periodB: {
      start: fallbackStart,
      end: fallbackEnd,
      label: formatCrimeDateRangeLabel(fallbackStart, fallbackEnd),
    },
  }
}

export function buildComparativeResult(
  periodA: CrimePeriodSnapshot,
  periodB: CrimePeriodSnapshot,
): CrimeComparativeResult {
  const change = periodA.totalVolume - periodB.totalVolume
  let changePct: number | null = null
  let direction: CrimeComparativeResult["direction"] = "flat"

  if (periodB.totalVolume > 0) {
    changePct = Math.round((change / periodB.totalVolume) * 1000) / 10
    if (changePct > 0) direction = "up"
    else if (changePct < 0) direction = "down"
  } else if (periodA.totalVolume > 0) {
    direction = "up"
  }

  return {
    periodA,
    periodB,
    change,
    changePct,
    direction,
  }
}
