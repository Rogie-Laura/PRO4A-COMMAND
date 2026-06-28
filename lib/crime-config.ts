export function isIndexCrimeCategory(category: string) {
  return category.trim().toUpperCase() === "INDEX"
}

export function isNonIndexCrimeCategory(category: string) {
  const normalized = category.trim().toUpperCase()
  return normalized.length > 0 && normalized !== "INDEX"
}

/** Always included in PPO crime profiles even when count is zero in both periods. */
export const INDEX_FOCUS_CRIME_ALWAYS = ["SP Complex"] as const

export function normalizeCrimeName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

export function crimeNamesMatch(left: string, right: string) {
  return normalizeCrimeName(left).toUpperCase() === normalizeCrimeName(right).toUpperCase()
}
