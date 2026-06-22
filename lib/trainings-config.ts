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
  if (lower.includes("hybrid")) return "Hybrid"

  return trimmed
}
