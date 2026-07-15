import { unstable_cache } from "next/cache"

import { BMI_CATEGORIES, type BmiCategoryId } from "@/lib/bmi-config"
import { formatMonthKeyLabel } from "@/lib/bmi-month"
import {
  fetchTwoRecentBmiBatchesForComparison,
  type BmiComparisonRow,
  type BmiMonthBatch,
} from "@/lib/bmi-records"
import { HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"
import type { BmiPersonnelDetail, BmiTrackingSummary } from "@/lib/health-types"

export { formatMonthKeyLabel }

/** Weight change within this many kg counts as "maintained" (measurement noise). */
const MAINTAIN_THRESHOLD_KG = 0.5

/** Adiposity ordinal: lower = leaner. Higher index = heavier BMI class. */
const CATEGORY_ORDINAL: Record<BmiCategoryId, number> = {
  underweight: 0,
  normal: 1,
  acceptable: 2,
  overweight: 3,
  "obese-1": 4,
  "obese-2": 5,
  "obese-3": 6,
}

/**
 * Order-insensitive identity key from a full name (rank already stripped upstream).
 * Sorting tokens survives First/Middle/Surname reordering between source files.
 */
export function bmiPersonKey(fullName: string): string {
  return String(fullName ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .sort()
    .join(" ")
}

function buildKeyedMap(rows: BmiComparisonRow[]): Map<string, BmiComparisonRow> {
  const map = new Map<string, BmiComparisonRow>()
  for (const row of rows) {
    const key = bmiPersonKey(row.fullName || row.rankFullname)
    if (!key) continue
    // First occurrence wins; keep it stable when a name repeats.
    if (!map.has(key)) map.set(key, row)
  }
  return map
}

export function buildBmiTrackingSummary(
  current: BmiMonthBatch,
  previous: BmiMonthBatch,
): BmiTrackingSummary {
  const currentMap = buildKeyedMap(current.rows)
  const previousMap = buildKeyedMap(previous.rows)

  let matchedCount = 0
  let gained = 0
  let lost = 0
  let maintained = 0
  let withWeightData = 0
  let netDeltaKg = 0

  let improved = 0
  let worsened = 0
  let unchanged = 0
  let withCategoryData = 0

  for (const [key, curr] of currentMap) {
    const prev = previousMap.get(key)
    if (!prev) continue
    matchedCount += 1

    if (curr.weightKg != null && prev.weightKg != null) {
      withWeightData += 1
      const delta = curr.weightKg - prev.weightKg
      netDeltaKg += delta
      if (delta > MAINTAIN_THRESHOLD_KG) gained += 1
      else if (delta < -MAINTAIN_THRESHOLD_KG) lost += 1
      else maintained += 1
    }

    if (curr.categoryId && prev.categoryId) {
      withCategoryData += 1
      const currIndex = CATEGORY_ORDINAL[curr.categoryId]
      const prevIndex = CATEGORY_ORDINAL[prev.categoryId]
      if (currIndex < prevIndex) improved += 1
      else if (currIndex > prevIndex) worsened += 1
      else unchanged += 1
    }
  }

  const onlyCurrentCount = currentMap.size - matchedCount
  const onlyPreviousCount = previousMap.size - matchedCount
  const avgDeltaKg =
    withWeightData > 0 ? Math.round((netDeltaKg / withWeightData) * 10) / 10 : null

  return {
    available: true,
    currentMonthKey: current.periodMonth,
    currentMonthLabel: formatMonthKeyLabel(current.periodMonth),
    previousMonthKey: previous.periodMonth,
    previousMonthLabel: formatMonthKeyLabel(previous.periodMonth),
    currentTotal: currentMap.size,
    previousTotal: previousMap.size,
    matchedCount,
    onlyCurrentCount,
    onlyPreviousCount,
    weight: {
      gained,
      lost,
      maintained,
      withWeightData,
      avgDeltaKg,
      netDeltaKg: Math.round(netDeltaKg * 10) / 10,
    },
    category: {
      improved,
      worsened,
      unchanged,
      withCategoryData,
    },
  }
}

function emptyTracking(): BmiTrackingSummary {
  return {
    available: false,
    currentMonthKey: null,
    currentMonthLabel: "—",
    previousMonthKey: null,
    previousMonthLabel: "—",
    currentTotal: 0,
    previousTotal: 0,
    matchedCount: 0,
    onlyCurrentCount: 0,
    onlyPreviousCount: 0,
    weight: { gained: 0, lost: 0, maintained: 0, withWeightData: 0, avgDeltaKg: null, netDeltaKg: 0 },
    category: { improved: 0, worsened: 0, unchanged: 0, withCategoryData: 0 },
  }
}

async function loadBmiTracking(): Promise<BmiTrackingSummary> {
  try {
    const pair = await fetchTwoRecentBmiBatchesForComparison()
    if (!pair) return emptyTracking()
    return buildBmiTrackingSummary(pair.current, pair.previous)
  } catch {
    return emptyTracking()
  }
}

/** Cached until a BMI upload/refresh invalidates the shared health analytics tag. */
const getCachedBmiTracking = unstable_cache(loadBmiTracking, ["bmi-tracking-v1"], {
  revalidate: false,
  tags: [HEALTH_ANALYTICS_CACHE_TAG],
})

export async function getBmiTracking(): Promise<BmiTrackingSummary> {
  return getCachedBmiTracking()
}

/** "HANSEL MATAMIS MARANTAN" -> "Marantan, Hansel M." (mirrors stored-record display). */
function formatComparisonName(row: BmiComparisonRow): string {
  const parts = (row.fullName || "").split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const surname = parts[parts.length - 1]
    const firstName = parts[0]
    const middle = parts.length > 2 && parts[1] ? ` ${parts[1].charAt(0)}.` : ""
    const titleCase = (value: string) =>
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    return `${titleCase(surname)}, ${titleCase(firstName)}${middle ? ` ${middle.trim().toUpperCase()}` : ""}`
  }
  return row.fullName || row.rankFullname || "Unknown"
}

function toPersonnelDetail(key: string, row: BmiComparisonRow): BmiPersonnelDetail {
  return {
    id: key,
    rank: row.rank,
    name: formatComparisonName(row),
    unit: row.subUnit || row.assignment || "—",
    age: row.age != null ? String(row.age) : "—",
  }
}

export type BmiCoveragePersonnel = {
  /** In the previous month but missing from the current month (no updated BMI). */
  notUpdated: BmiPersonnelDetail[]
  /** In the current month but not present in the previous month (newly recorded). */
  newlyRecorded: BmiPersonnelDetail[]
}

function buildCoveragePersonnel(
  current: BmiMonthBatch,
  previous: BmiMonthBatch,
): BmiCoveragePersonnel {
  const currentMap = buildKeyedMap(current.rows)
  const previousMap = buildKeyedMap(previous.rows)

  const notUpdated: BmiPersonnelDetail[] = []
  for (const [key, prev] of previousMap) {
    if (!currentMap.has(key)) notUpdated.push(toPersonnelDetail(key, prev))
  }

  const newlyRecorded: BmiPersonnelDetail[] = []
  for (const [key, curr] of currentMap) {
    if (!previousMap.has(key)) newlyRecorded.push(toPersonnelDetail(key, curr))
  }

  const byName = (a: BmiPersonnelDetail, b: BmiPersonnelDetail) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })

  notUpdated.sort(byName)
  newlyRecorded.sort(byName)

  return { notUpdated, newlyRecorded }
}

async function loadBmiCoveragePersonnel(): Promise<BmiCoveragePersonnel> {
  try {
    const pair = await fetchTwoRecentBmiBatchesForComparison()
    if (!pair) return { notUpdated: [], newlyRecorded: [] }
    return buildCoveragePersonnel(pair.current, pair.previous)
  } catch {
    return { notUpdated: [], newlyRecorded: [] }
  }
}

const getCachedBmiCoveragePersonnel = unstable_cache(
  loadBmiCoveragePersonnel,
  ["bmi-coverage-personnel-v1"],
  { revalidate: false, tags: [HEALTH_ANALYTICS_CACHE_TAG] },
)

export async function getBmiCoveragePersonnel(): Promise<BmiCoveragePersonnel> {
  return getCachedBmiCoveragePersonnel()
}

// Re-exported for reuse in labels/config validation elsewhere if needed.
export const BMI_CATEGORY_LABELS = Object.fromEntries(
  BMI_CATEGORIES.map((category) => [category.id, category.label]),
) as Record<BmiCategoryId, string>
