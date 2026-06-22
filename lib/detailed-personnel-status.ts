import type {
  DetailedPersonnelAnalytics,
  DetailedPersonnelRecord,
} from "@/lib/detailed-personnel-types"

export const DETAILED_ORDER_EXPIRY_WINDOW_DAYS = 15

export type DetailedPersonnelRecordWithSource = DetailedPersonnelRecord & {
  sourceTab: string
  recordKey: string
}

export type DetailedPersonnelStatusCounts = {
  terminatedCount: number
  expiringCount: number
}

export type DetailedPersonnelStatusSummary = DetailedPersonnelStatusCounts & {
  terminatedRecords: DetailedPersonnelRecordWithSource[]
  expiringRecords: DetailedPersonnelRecordWithSource[]
}

export function isTerminatedDetailedOrder(record: DetailedPersonnelRecord): boolean {
  return record.daysRemaining.trim().toUpperCase() === "TERMINATED"
}

export function parseDaysRemaining(daysRemaining: string): number | null {
  const trimmed = daysRemaining.trim()
  if (!trimmed || trimmed.toUpperCase() === "TERMINATED") return null

  const match = trimmed.match(/(\d+)\s*days?\s*(?:to go|left(?:\s+to go)?)/i)
  return match ? Number.parseInt(match[1], 10) : null
}

export function isExpiringDetailedOrder(
  record: DetailedPersonnelRecord,
  withinDays = DETAILED_ORDER_EXPIRY_WINDOW_DAYS,
): boolean {
  const days = parseDaysRemaining(record.daysRemaining)
  return days !== null && days >= 0 && days <= withinDays
}

function withSource(
  record: DetailedPersonnelRecord,
  sourceTab: string,
): DetailedPersonnelRecordWithSource {
  return {
    ...record,
    sourceTab,
    recordKey: `${sourceTab}-${record.no}-${record.badgeNumber}-${record.lastName}`,
  }
}

function compareExpiringRecords(
  a: DetailedPersonnelRecordWithSource,
  b: DetailedPersonnelRecordWithSource,
) {
  const daysA = parseDaysRemaining(a.daysRemaining) ?? Number.MAX_SAFE_INTEGER
  const daysB = parseDaysRemaining(b.daysRemaining) ?? Number.MAX_SAFE_INTEGER

  if (daysA !== daysB) return daysA - daysB

  return a.lastName.localeCompare(b.lastName)
}

function compareTerminatedRecords(
  a: DetailedPersonnelRecordWithSource,
  b: DetailedPersonnelRecordWithSource,
) {
  return a.endDate.localeCompare(b.endDate) || a.lastName.localeCompare(b.lastName)
}

export function buildDetailedPersonnelStatusCounts(
  ...analytics: DetailedPersonnelAnalytics[]
): DetailedPersonnelStatusCounts {
  const summary = buildDetailedPersonnelStatusSummary(...analytics)
  return {
    terminatedCount: summary.terminatedCount,
    expiringCount: summary.expiringCount,
  }
}

export function buildDetailedPersonnelStatusSummary(
  ...analytics: DetailedPersonnelAnalytics[]
): DetailedPersonnelStatusSummary {
  const terminatedRecords: DetailedPersonnelRecordWithSource[] = []
  const expiringRecords: DetailedPersonnelRecordWithSource[] = []

  for (const data of analytics) {
    for (const record of data.records) {
      const enriched = withSource(record, data.title)

      if (isTerminatedDetailedOrder(record)) {
        terminatedRecords.push(enriched)
        continue
      }

      if (isExpiringDetailedOrder(record)) {
        expiringRecords.push(enriched)
      }
    }
  }

  terminatedRecords.sort(compareTerminatedRecords)
  expiringRecords.sort(compareExpiringRecords)

  return {
    terminatedCount: terminatedRecords.length,
    expiringCount: expiringRecords.length,
    terminatedRecords,
    expiringRecords,
  }
}
