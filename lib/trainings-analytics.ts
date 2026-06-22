import { unstable_cache } from "next/cache"

import type { CountItem } from "@/lib/personnel-types"
import { fetchTrainingsSheetCsv, parseCsvRows } from "@/lib/google-sheets"
import {
  formatMonthLabel,
  formatTrainingMode,
  resolveTrainingMode,
  resolveTrainingStatus,
  TRAINING_MONTHS,
  TRAINING_STATUS_LABELS,
  TRAINING_STATUS_ORDER,
} from "@/lib/trainings-config"
import { TRAININGS_SHEET } from "@/lib/trainings-sheet"
import type { TrainingRecord, TrainingsAnalytics } from "@/lib/trainings-types"

type ColumnMap = {
  activity: number
  classCount: number
  dateOpening: number
  dateClosing: number
  proposedSchedule: number
  status: number
  durationDays: number
  mode: number
  opr: number
  facilitator: number
  venue: number
  totalParticipants: number
}

function emptyAnalytics(): TrainingsAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: TRAININGS_SHEET.label,
    programYear: TRAININGS_SHEET.programYear,
    total: 0,
    uniquePrograms: 0,
    totalParticipants: 0,
    completionRate: 0,
    statusStats: [],
    modeStats: [],
    monthStats: [],
    records: [],
  }
}

function findColumnMap(rows: string[][]): { headerIdx: number; columns: ColumnMap } | null {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i].map((cell) => cell.replace(/^\uFEFF/, "").trim())
    const activity = row.findIndex((cell) => /ACTIVITY\/TRAINING/i.test(cell))
    const status = row.findIndex((cell) => /^STATUS$/i.test(cell))

    if (activity < 0 || status < 0) continue

    const indexOf = (pattern: RegExp, fallback = -1) => {
      const idx = row.findIndex((cell) => pattern.test(cell))
      return idx >= 0 ? idx : fallback
    }

    return {
      headerIdx: i,
      columns: {
        activity,
        classCount: indexOf(/No\.?\s*of\s*Class/i, activity + 1),
        dateOpening: indexOf(/DATE OF OPENING/i, activity + 2),
        dateClosing: indexOf(/DATE OF CLOSING/i, activity + 3),
        proposedSchedule: indexOf(/PROPOSED SCHEDULE/i),
        status,
        durationDays: indexOf(/DURATION/i, status + 1),
        mode: indexOf(/MODE OF INSTRUCTION/i, status + 2),
        opr: indexOf(/^OPR$/i),
        facilitator: indexOf(/^FACI/i),
        venue: indexOf(/^VENUE$/i),
        totalParticipants: indexOf(/TOTAL PARTICIPANTS/i),
      },
    }
  }

  return null
}

function parseNumber(value: string) {
  const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function cellAt(row: string[], index: number) {
  if (index < 0) return ""
  return row[index]?.trim() ?? ""
}

function effectiveClassCount(record: TrainingRecord) {
  return record.classCount > 0 ? record.classCount : 1
}

function sumClassCounts(records: TrainingRecord[]) {
  return records.reduce((sum, record) => sum + effectiveClassCount(record), 0)
}

function parsePlannedTotalClasses(rows: string[][], columns: ColumnMap, headerIdx: number) {
  let total = 0

  for (const row of rows.slice(headerIdx + 1)) {
    const activity = (row[columns.activity] ?? "").trim()
    if (!/^TOTAL$/i.test(activity)) continue
    total += parseNumber(row[columns.classCount] ?? "")
  }

  return total
}

function buildCountItems(
  counts: Map<string, number>,
  total: number,
  sortByCount = true,
): CountItem[] {
  const denominator = total || 1
  const items = [...counts.entries()].map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / denominator) * 1000) / 10,
  }))

  if (sortByCount) {
    return items.sort((a, b) => b.count - a.count)
  }

  return items
}

function buildStatusStats(records: TrainingRecord[], totalClasses: number): CountItem[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    const label = TRAINING_STATUS_LABELS[record.status]
    counts.set(label, (counts.get(label) ?? 0) + effectiveClassCount(record))
  }

  const total = totalClasses || sumClassCounts(records) || 1

  return TRAINING_STATUS_ORDER.map((status) => {
    const label = TRAINING_STATUS_LABELS[status]
    const count = counts.get(label) ?? 0

    return {
      name: label,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }
  }).filter((item) => item.count > 0)
}

function buildModeStats(records: TrainingRecord[]): CountItem[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    const mode = resolveTrainingMode(record.mode, record.venue)
    counts.set(mode, (counts.get(mode) ?? 0) + effectiveClassCount(record))
  }

  return buildCountItems(counts, sumClassCounts(records))
}

function buildMonthStats(records: TrainingRecord[]): CountItem[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    const month = formatMonthLabel(record.month)
    counts.set(month, (counts.get(month) ?? 0) + effectiveClassCount(record))
  }

  const monthOrder = [...TRAINING_MONTHS].map((month) => formatMonthLabel(month))
  const total = sumClassCounts(records) || 1

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name))
}

export function parseTrainingsCsv(text: string): TrainingRecord[] {
  const rows = parseCsvRows(text)
  const header = findColumnMap(rows)

  if (!header) return []

  const { headerIdx, columns } = header
  const records: TrainingRecord[] = []
  let currentMonth = ""
  let lastActivity = ""

  for (let rowIndex = headerIdx + 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    let activity = (row[columns.activity] ?? "").trim()
    const statusRaw = row[columns.status] ?? ""

    if (TRAINING_MONTHS.has(activity.toUpperCase())) {
      currentMonth = activity.toUpperCase()
      lastActivity = ""
      continue
    }

    if (/^TOTAL$/i.test(activity)) continue

    const classCount = parseNumber(cellAt(row, columns.classCount))
    const dateOpening = cellAt(row, columns.dateOpening)
    const dateClosing = cellAt(row, columns.dateClosing)

    if (!activity) {
      if (!lastActivity) continue
      activity = lastActivity
    } else {
      lastActivity = activity
    }

    const modeRaw = cellAt(row, columns.mode)
    const venue = cellAt(row, columns.venue)
    const facilitator = cellAt(row, columns.facilitator)

    const status = resolveTrainingStatus(statusRaw, activity, {
      classCount,
      dateOpening,
      dateClosing,
    })
    if (!status) continue

    records.push({
      id: `${rowIndex}-${activity.slice(0, 40)}`,
      activity,
      month: currentMonth,
      classCount,
      dateOpening,
      dateClosing,
      proposedSchedule: cellAt(row, columns.proposedSchedule),
      status,
      durationDays: cellAt(row, columns.durationDays),
      mode: resolveTrainingMode(modeRaw, venue),
      opr: cellAt(row, columns.opr),
      facilitator,
      venue,
      totalParticipants: parseNumber(cellAt(row, columns.totalParticipants)),
    })
  }

  return records
}

export function parseTrainingsCsvWithMeta(text: string) {
  const rows = parseCsvRows(text)
  const header = findColumnMap(rows)
  const records = parseTrainingsCsv(text)
  const plannedTotalClasses = header
    ? parsePlannedTotalClasses(rows, header.columns, header.headerIdx)
    : 0

  return { records, plannedTotalClasses }
}

async function loadTrainingsAnalytics(): Promise<TrainingsAnalytics> {
  try {
    const csv = await fetchTrainingsSheetCsv()
    const { records, plannedTotalClasses } = parseTrainingsCsvWithMeta(csv)

    if (records.length === 0) {
      return emptyAnalytics()
    }

    const classifiedClasses = sumClassCounts(records)
    const totalClasses = plannedTotalClasses || classifiedClasses
    const completedClasses = sumClassCounts(
      records.filter((record) => record.status === "COMPLETED"),
    )
    const uniquePrograms = new Set(records.map((record) => record.activity)).size
    const totalParticipants = records.reduce(
      (sum, record) => sum + record.totalParticipants,
      0,
    )

    return {
      lastUpdated: new Date().toISOString(),
      dataReady: true,
      dataSource: TRAININGS_SHEET.label,
      programYear: TRAININGS_SHEET.programYear,
      total: totalClasses,
      uniquePrograms,
      totalParticipants,
      completionRate: Math.round((completedClasses / totalClasses) * 1000) / 10,
      statusStats: buildStatusStats(records, totalClasses),
      modeStats: buildModeStats(records),
      monthStats: buildMonthStats(records),
      records,
    }
  } catch {
    return emptyAnalytics()
  }
}

export const TRAININGS_ANALYTICS_CACHE_TAG = "trainings-analytics-v8"

/** Cached until manual refresh — no repeat Google Sheet fetch on revisit. */
const getCachedTrainingsAnalytics = unstable_cache(
  loadTrainingsAnalytics,
  [TRAININGS_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [TRAININGS_ANALYTICS_CACHE_TAG] },
)

export async function getTrainingsAnalytics(): Promise<TrainingsAnalytics> {
  return getCachedTrainingsAnalytics()
}
