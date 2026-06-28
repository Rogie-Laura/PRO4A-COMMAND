import {
  endOfMonthFromMonthKey,
  formatCrimeDateLabel,
  formatCrimeDateRangeLabel,
  parseCrimeDisplayDate,
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
  /** Previous / baseline period. */
  periodA: CrimePeriodSnapshot
  /** Period under review (current comparison target). */
  periodB: CrimePeriodSnapshot
  /** periodB.totalVolume - periodA.totalVolume */
  change: number
  changePct: number | null
  direction: "up" | "down" | "flat"
}

export type CrimeFocusComparativeRow = {
  crime: string
  periodA: number
  periodB: number
  change: number
  changePct: number | null
  changeDirection: "up" | "down" | "flat" | null
}

export function buildCountChangeMetrics(periodA: number, periodB: number): {
  change: number
  changePct: number | null
  changeDirection: CrimeFocusComparativeRow["changeDirection"]
} {
  const change = periodB - periodA
  let changePct: number | null = null
  let changeDirection: CrimeFocusComparativeRow["changeDirection"] = null

  if (periodA > 0) {
    changePct = Math.round((change / periodA) * 1000) / 10
    if (changePct > 0) changeDirection = "up"
    else if (changePct < 0) changeDirection = "down"
    else changeDirection = "flat"
  } else if (periodB > 0) {
    changeDirection = "up"
  } else if (periodA === 0 && periodB === 0) {
    changeDirection = null
  }

  return { change, changePct, changeDirection }
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
    label: "Latest month vs previous month",
    description: "Huling buwan na may data vs nakaraang buwan",
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
    description: "Period A = previous · Period B = period in review",
  },
]

function clampRange(start: Date, end: Date, bounds?: { min: string; max: string } | null) {
  let nextStart = startOfDay(start)
  let nextEnd = startOfDay(end)

  if (bounds) {
    const minDate = startOfDay(new Date(`${bounds.min}T00:00:00`))
    const maxDate = startOfDay(new Date(`${bounds.max}T00:00:00`))
    if (nextStart < minDate) nextStart = minDate
    if (nextEnd > maxDate) nextEnd = maxDate
    if (nextStart > maxDate) nextStart = maxDate
    if (nextEnd < minDate) nextEnd = minDate
  }

  if (nextStart > nextEnd) {
    const anchor = nextEnd
    nextStart = anchor
    nextEnd = anchor
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

export type CrimeDataBounds = {
  min: string
  max: string
  asOfLabel: string
  referenceDate: Date
}

export function getCrimeDataBounds(input: {
  monthlyBreakdown: { monthKey: string }[]
  coveredPeriodStart: string | null
  coveredPeriodEnd: string | null
}): CrimeDataBounds | null {
  const firstMonth = input.monthlyBreakdown[0]?.monthKey
  const lastMonth = input.monthlyBreakdown[input.monthlyBreakdown.length - 1]?.monthKey

  const minFromCover = parseCrimeDisplayDate(input.coveredPeriodStart)
  const maxFromCover = parseCrimeDisplayDate(input.coveredPeriodEnd)

  const min =
    (minFromCover ? toIsoDateString(minFromCover) : null) ??
    (firstMonth ? `${firstMonth}-01` : null)
  const max =
    (maxFromCover ? toIsoDateString(maxFromCover) : null) ??
    (lastMonth ? endOfMonthFromMonthKey(lastMonth) : null)

  if (!min || !max || min > max) return null

  const referenceDate = maxFromCover ?? startOfDay(new Date(`${max}T00:00:00`))

  return {
    min,
    max,
    asOfLabel: formatCrimeDateLabel(max),
    referenceDate,
  }
}

/** @deprecated Use getCrimeDataBounds for actual latest-record dates. */
export function getDataDateBounds(monthlyBreakdown: { monthKey: string }[]) {
  return getCrimeDataBounds({
    monthlyBreakdown,
    coveredPeriodStart: null,
    coveredPeriodEnd: null,
  })
}

export function buildPresetRanges(
  presetId: ComparativePresetId,
  bounds?: CrimeDataBounds | null,
): { periodA: CrimePeriodRange; periodB: CrimePeriodRange } {
  const today = startOfDay(bounds?.referenceDate ?? new Date())

  if (presetId === "month-vs-last-month") {
    const reviewStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const reviewEnd = today
    const previousStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const previousEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    const periodA = clampRange(previousStart, previousEnd, bounds)
    const periodB = clampRange(reviewStart, reviewEnd, bounds)

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
    const reviewEnd = today
    const reviewStart = new Date(today)
    reviewStart.setDate(reviewStart.getDate() - 29)

    const previousEnd = new Date(reviewStart)
    previousEnd.setDate(previousEnd.getDate() - 1)
    const previousStart = new Date(previousEnd)
    previousStart.setDate(previousStart.getDate() - 29)

    const periodA = clampRange(previousStart, previousEnd, bounds)
    const periodB = clampRange(reviewStart, reviewEnd, bounds)

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
    const reviewStart = getQuarterStart(today)
    const reviewEnd = today
    const previousQuarterEnd = new Date(reviewStart)
    previousQuarterEnd.setDate(previousQuarterEnd.getDate() - 1)
    const previousStart = getQuarterStart(previousQuarterEnd)
    const previousEnd = getQuarterEnd(previousQuarterEnd)

    const periodA = clampRange(previousStart, previousEnd, bounds)
    const periodB = clampRange(reviewStart, reviewEnd, bounds)

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
    const reviewStart = new Date(today.getFullYear(), 0, 1)
    const reviewEnd = today
    const previousStart = new Date(today.getFullYear() - 1, 0, 1)
    const previousEnd = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

    const periodA = clampRange(previousStart, previousEnd, bounds)
    const periodB = clampRange(reviewStart, reviewEnd, bounds)

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

  const fallbackReviewEnd = bounds?.max ?? toIsoDateString(today)
  const fallbackReviewStart =
    bounds?.min ?? toIsoDateString(new Date(today.getFullYear(), today.getMonth(), 1))
  const fallbackPreviousEnd = new Date(`${fallbackReviewStart}T00:00:00`)
  fallbackPreviousEnd.setDate(fallbackPreviousEnd.getDate() - 1)
  const fallbackPreviousStart = new Date(fallbackPreviousEnd)
  fallbackPreviousStart.setDate(fallbackPreviousStart.getDate() - 29)

  const periodA = clampRange(fallbackPreviousStart, fallbackPreviousEnd, bounds)
  const periodB = clampRange(
    new Date(`${fallbackReviewStart}T00:00:00`),
    new Date(`${fallbackReviewEnd}T00:00:00`),
    bounds,
  )

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

export function buildComparativeResult(
  periodA: CrimePeriodSnapshot,
  periodB: CrimePeriodSnapshot,
): CrimeComparativeResult {
  const change = periodB.totalVolume - periodA.totalVolume
  let changePct: number | null = null
  let direction: CrimeComparativeResult["direction"] = "flat"

  if (periodA.totalVolume > 0) {
    changePct = Math.round((change / periodA.totalVolume) * 1000) / 10
    if (changePct > 0) direction = "up"
    else if (changePct < 0) direction = "down"
  } else if (periodB.totalVolume > 0) {
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
