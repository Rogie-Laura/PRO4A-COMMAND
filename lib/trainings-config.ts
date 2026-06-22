export const TRAINING_MONTHS = new Set([
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
])

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
