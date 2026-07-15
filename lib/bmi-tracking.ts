import { unstable_cache } from "next/cache"

import { BMI_CATEGORIES, type BmiCategoryId } from "@/lib/bmi-config"
import { formatMonthKeyLabel } from "@/lib/bmi-month"
import {
  fetchBmiRecordsByNameToken,
  fetchTwoRecentBmiBatchesForComparison,
  type BmiComparisonRow,
  type BmiMonthBatch,
} from "@/lib/bmi-records"
import { HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"
import type {
  BmiMovementBucket,
  BmiMovementPerson,
  BmiTrackingSummary,
  BmiTrendPoint,
} from "@/lib/health-types"

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

// Re-exported for reuse in labels/config validation elsewhere if needed.
export const BMI_CATEGORY_LABELS = Object.fromEntries(
  BMI_CATEGORIES.map((category) => [category.id, category.label]),
) as Record<BmiCategoryId, string>

function categoryLabel(id: BmiCategoryId | null | undefined): string | null {
  return id ? (BMI_CATEGORY_LABELS[id] ?? null) : null
}

/** Longest alphabetic token from a name — used to narrow the trend lookup query. */
function longestToken(fullName: string): string {
  const tokens = String(fullName ?? "")
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3)
  if (tokens.length === 0) return ""
  return tokens.reduce((longest, token) => (token.length > longest.length ? token : longest), "")
}

function toMovementPerson(
  key: string,
  prev: BmiComparisonRow | undefined,
  curr: BmiComparisonRow | undefined,
): BmiMovementPerson {
  const base = curr ?? prev
  const prevWeight = prev?.weightKg ?? null
  const currWeight = curr?.weightKg ?? null
  const deltaKg =
    prevWeight != null && currWeight != null
      ? Math.round((currWeight - prevWeight) * 10) / 10
      : null

  return {
    id: key,
    key,
    filterToken: longestToken(base?.fullName || base?.rankFullname || ""),
    rank: base?.rank ?? "",
    name: base ? formatComparisonName(base) : "Unknown",
    unit: base?.subUnit || base?.assignment || "—",
    prevWeightKg: prevWeight,
    currWeightKg: currWeight,
    deltaKg,
    prevCategoryLabel: categoryLabel(prev?.categoryId),
    currCategoryLabel: categoryLabel(curr?.categoryId),
  }
}

/** All personnel drilldown buckets for the two most recent BMI snapshots. */
export type BmiMovementDetail = Record<BmiMovementBucket, BmiMovementPerson[]>

export type { BmiMovementBucket }

function emptyMovementDetail(): BmiMovementDetail {
  return {
    gained: [],
    lost: [],
    maintained: [],
    improved: [],
    worsened: [],
    unchanged: [],
    notUpdated: [],
    newlyRecorded: [],
  }
}

function buildMovementDetail(
  current: BmiMonthBatch,
  previous: BmiMonthBatch,
): BmiMovementDetail {
  const currentMap = buildKeyedMap(current.rows)
  const previousMap = buildKeyedMap(previous.rows)
  const detail = emptyMovementDetail()

  for (const [key, curr] of currentMap) {
    const prev = previousMap.get(key)
    if (!prev) {
      detail.newlyRecorded.push(toMovementPerson(key, undefined, curr))
      continue
    }

    const person = toMovementPerson(key, prev, curr)

    if (person.deltaKg != null) {
      if (person.deltaKg > MAINTAIN_THRESHOLD_KG) detail.gained.push(person)
      else if (person.deltaKg < -MAINTAIN_THRESHOLD_KG) detail.lost.push(person)
      else detail.maintained.push(person)
    }

    const prevOrdinal = prev.categoryId != null ? CATEGORY_ORDINAL[prev.categoryId] : null
    const currOrdinal = curr.categoryId != null ? CATEGORY_ORDINAL[curr.categoryId] : null
    if (prevOrdinal != null && currOrdinal != null) {
      if (currOrdinal < prevOrdinal) detail.improved.push(person)
      else if (currOrdinal > prevOrdinal) detail.worsened.push(person)
      else detail.unchanged.push(person)
    }
  }

  for (const [key, prev] of previousMap) {
    if (!currentMap.has(key)) detail.notUpdated.push(toMovementPerson(key, prev, undefined))
  }

  const byName = (a: BmiMovementPerson, b: BmiMovementPerson) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  // Weight buckets read best largest-change first; others alphabetical.
  detail.gained.sort((a, b) => (b.deltaKg ?? 0) - (a.deltaKg ?? 0))
  detail.lost.sort((a, b) => (a.deltaKg ?? 0) - (b.deltaKg ?? 0))
  detail.maintained.sort(byName)
  detail.improved.sort(byName)
  detail.worsened.sort(byName)
  detail.unchanged.sort(byName)
  detail.notUpdated.sort(byName)
  detail.newlyRecorded.sort(byName)

  return detail
}

async function loadBmiMovementDetail(): Promise<BmiMovementDetail> {
  try {
    const pair = await fetchTwoRecentBmiBatchesForComparison()
    if (!pair) return emptyMovementDetail()
    return buildMovementDetail(pair.current, pair.previous)
  } catch {
    return emptyMovementDetail()
  }
}

const getCachedBmiMovementDetail = unstable_cache(
  loadBmiMovementDetail,
  ["bmi-movement-detail-v1"],
  { revalidate: false, tags: [HEALTH_ANALYTICS_CACHE_TAG] },
)

export async function getBmiMovementDetail(): Promise<BmiMovementDetail> {
  return getCachedBmiMovementDetail()
}

export async function getBmiMovementBucket(
  bucket: BmiMovementBucket,
): Promise<BmiMovementPerson[]> {
  const detail = await getCachedBmiMovementDetail()
  return detail[bucket] ?? []
}

/**
 * One personnel's weight/BMI trend across ALL stored months, resolved by matching
 * the order-insensitive name key. `filterToken` narrows the DB scan to a surname.
 */
export async function getBmiPersonTrend(
  key: string,
  filterToken: string,
): Promise<BmiTrendPoint[]> {
  const token = filterToken.trim()
  if (!key || !token) return []

  let candidates
  try {
    candidates = await fetchBmiRecordsByNameToken(token)
  } catch {
    return []
  }

  const byMonth = new Map<string, BmiTrendPoint>()
  for (const row of candidates) {
    if (!row.periodMonth) continue
    if (bmiPersonKey(row.fullName || row.rankFullname) !== key) continue
    // First row per month wins (stable across duplicates).
    if (byMonth.has(row.periodMonth)) continue
    byMonth.set(row.periodMonth, {
      monthKey: row.periodMonth,
      monthLabel: formatMonthKeyLabel(row.periodMonth),
      weightKg: row.weightKg,
      bmiResult: row.bmiResult,
      categoryLabel: categoryLabel(row.categoryId),
    })
  }

  return Array.from(byMonth.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey))
}
