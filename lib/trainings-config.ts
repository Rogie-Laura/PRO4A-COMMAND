export const TRAINING_MONTH_ORDER = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const

export const TRAINING_MONTHS = new Set<string>(TRAINING_MONTH_ORDER)

export const TRAINING_STATUSES = [
  "COMPLETED",
  "ONGOING",
  "TO BE OPENED",
  "CANCELLED",
  "POSTPONED",
] as const

export type TrainingStatus = (typeof TRAINING_STATUSES)[number]

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  COMPLETED: "Completed",
  ONGOING: "Ongoing",
  "TO BE OPENED": "To Be Opened",
  CANCELLED: "Cancelled",
  POSTPONED: "Postponed",
}

export const TRAINING_STATUS_ORDER: TrainingStatus[] = [
  "COMPLETED",
  "ONGOING",
  "TO BE OPENED",
  "CANCELLED",
  "POSTPONED",
]

export function normalizeTrainingStatus(value: string): TrainingStatus | null {
  const status = value.replace(/\s+/g, " ").trim().toUpperCase()
  const normalized =
    status === "ON GOING" || status === "ON-GOING" ? "ONGOING" : status

  if (TRAINING_STATUSES.includes(normalized as TrainingStatus)) {
    return normalized as TrainingStatus
  }

  return null
}

/** RTAP scorecard / misaligned rows that share the activity column. */
export function isScorecardNoiseRow(activity: string) {
  const trimmed = activity.trim()
  if (!trimmed) return true
  if (/^GRAND TOTAL$/i.test(trimmed)) return true
  if (/#DIV\/0!|#REF!/i.test(trimmed)) return true
  if (/^\d{2,3},[\d.%]/.test(trimmed)) return true
  if (/^\d{4},TO BE OPENED/i.test(trimmed)) return true

  return false
}

export function resolveTrainingStatus(
  statusRaw: string,
  activity: string,
  options?: { classCount?: number; dateOpening?: string; dateClosing?: string },
): TrainingStatus | null {
  const normalized = normalizeTrainingStatus(statusRaw)
  if (normalized) return normalized

  if (isScorecardNoiseRow(activity)) return null

  const hasTrainingData =
    (options?.classCount ?? 0) > 0 ||
    Boolean(options?.dateOpening?.trim()) ||
    Boolean(options?.dateClosing?.trim())

  if (!hasTrainingData) return null

  return "TO BE OPENED"
}

export function formatMonthLabel(month: string) {
  if (!month) return "Unspecified"
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()
}

const PHILIPPINES_TIMEZONE = "Asia/Manila"

export function getCurrentRtapMonthKey(referenceDate = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PHILIPPINES_TIMEZONE,
    month: "long",
  })
    .format(referenceDate)
    .toUpperCase()
}

export function getNextRtapMonthKey(referenceDate = new Date()) {
  const currentMonth = getCurrentRtapMonthKey(referenceDate)
  const currentIndex = TRAINING_MONTH_ORDER.indexOf(
    currentMonth as (typeof TRAINING_MONTH_ORDER)[number],
  )

  if (currentIndex === -1) {
    return TRAINING_MONTH_ORDER[0]
  }

  return TRAINING_MONTH_ORDER[(currentIndex + 1) % TRAINING_MONTH_ORDER.length]
}

export function formatTrainingMode(mode: string) {
  const trimmed = mode.trim()
  if (!trimmed) return "Unspecified"

  const lower = trimmed.toLowerCase()
  if (lower.includes("face")) return "Face-to-face"
  if (lower.includes("online") || lower.includes("zoom")) return "Online"
  if (lower.includes("hybrid") || lower.includes("blended")) return "Hybrid"

  return "Unspecified"
}

export function resolveTrainingMode(mode: string, venue: string) {
  if (mode.trim()) return formatTrainingMode(mode)

  return formatTrainingMode(venue)
}
