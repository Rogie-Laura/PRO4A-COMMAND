import { parseBirthDate } from "@/lib/age-config"

export const RANK_TENURE_LESS_THAN_1_ID = "less-than-1"
export const RANK_TENURE_LESS_THAN_1_LABEL = "Less than 1 yr"

export const RANK_TENURE_BRACKETS = [
  { id: "1-5", label: "1-5 yrs", min: 1, max: 5 },
  { id: "6-7", label: "6-7 yrs", min: 6, max: 7 },
  { id: "8", label: "8 yrs", exact: 8 },
  { id: "9", label: "9 yrs", exact: 9 },
] as const

export const RANK_TENURE_ABOVE_10_ID = "10-above"
export const RANK_TENURE_ABOVE_10_LABEL = "10 yrs above"

export const RANK_TENURE_DRILLDOWN_BRACKET_IDS = ["8", "9", RANK_TENURE_ABOVE_10_ID] as const

export type RankTenureDrilldownBracketId = (typeof RANK_TENURE_DRILLDOWN_BRACKET_IDS)[number]
export type RankTenureBracketId =
  | typeof RANK_TENURE_LESS_THAN_1_ID
  | (typeof RANK_TENURE_BRACKETS)[number]["id"]
  | typeof RANK_TENURE_ABOVE_10_ID

export const RANK_TENURE_TABLE_COLUMNS: { id: RankTenureBracketId; label: string }[] = [
  { id: RANK_TENURE_LESS_THAN_1_ID, label: RANK_TENURE_LESS_THAN_1_LABEL },
  ...RANK_TENURE_BRACKETS.map((bracket) => ({ id: bracket.id, label: bracket.label })),
  { id: RANK_TENURE_ABOVE_10_ID, label: RANK_TENURE_ABOVE_10_LABEL },
]

export function parsePromotionDate(value: string) {
  return parseBirthDate(value)
}

/** Full months elapsed since promotion (anniversary-based, not rounded up). */
export function calculateMonthsInRank(promotionDate: Date, asOf = new Date()) {
  let months = (asOf.getFullYear() - promotionDate.getFullYear()) * 12
  months += asOf.getMonth() - promotionDate.getMonth()

  if (asOf.getDate() < promotionDate.getDate()) {
    months -= 1
  }

  return Math.max(0, months)
}

/** True only when tenure is strictly under 12 months — does not count as 1 yr yet. */
export function isLessThanOneYearInRank(promotionDate: Date, asOf = new Date()) {
  return calculateMonthsInRank(promotionDate, asOf) < 12
}

/** Completed full years in rank (0 until the first anniversary). */
export function calculateYearsInRank(promotionDate: Date, asOf = new Date()) {
  return Math.floor(calculateMonthsInRank(promotionDate, asOf) / 12)
}

export function getRankTenureBracketId(yearsInRank: number): RankTenureBracketId | null {
  if (yearsInRank < 1) return null
  if (yearsInRank >= 10) return RANK_TENURE_ABOVE_10_ID
  if (yearsInRank === 9) return "9"
  if (yearsInRank === 8) return "8"
  if (yearsInRank >= 6 && yearsInRank <= 7) return "6-7"
  if (yearsInRank >= 1 && yearsInRank <= 5) return "1-5"

  return null
}

export function getRankTenureBracketFromPromotionDate(
  promotionDate: string,
): RankTenureBracketId | null {
  const parsed = parsePromotionDate(promotionDate)
  if (!parsed) return null

  if (isLessThanOneYearInRank(parsed)) {
    return RANK_TENURE_LESS_THAN_1_ID
  }

  return getRankTenureBracketId(calculateYearsInRank(parsed))
}

export function isRankTenureDrilldownBracket(
  bracketId: string,
): bracketId is RankTenureDrilldownBracketId {
  return (RANK_TENURE_DRILLDOWN_BRACKET_IDS as readonly string[]).includes(bracketId)
}
