import { calculateAge, parseBirthDate } from "@/lib/age-config"

export const RANK_TENURE_BRACKETS = [
  { id: "1-5", label: "1-5", min: 0, max: 5 },
  { id: "6-9", label: "6-9 yrs", min: 6, max: 9 },
] as const

export const RANK_TENURE_ABOVE_10_ID = "10-above"
export const RANK_TENURE_ABOVE_10_LABEL = "10 Above"

export type RankTenureBracketId = (typeof RANK_TENURE_BRACKETS)[number]["id"]
export type RankTenureDistributionId = RankTenureBracketId | typeof RANK_TENURE_ABOVE_10_ID

export function parsePromotionDate(value: string) {
  return parseBirthDate(value)
}

export function calculateYearsInRank(promotionDate: Date, asOf = new Date()) {
  return calculateAge(promotionDate, asOf)
}

export function getRankTenureBracketId(yearsInRank: number): RankTenureDistributionId | null {
  if (yearsInRank < 0) return null
  if (yearsInRank >= 10) return RANK_TENURE_ABOVE_10_ID

  const bracket = RANK_TENURE_BRACKETS.find(
    (item) => yearsInRank >= item.min && yearsInRank <= item.max,
  )
  return bracket?.id ?? null
}

export function getRankTenureBracketFromPromotionDate(
  promotionDate: string,
): RankTenureDistributionId | null {
  const parsed = parsePromotionDate(promotionDate)
  if (!parsed) return null

  return getRankTenureBracketId(calculateYearsInRank(parsed))
}
