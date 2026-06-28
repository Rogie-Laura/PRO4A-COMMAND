export function isIndexCrimeCategory(category: string) {
  return category.trim().toUpperCase() === "INDEX"
}

export function isNonIndexCrimeCategory(category: string) {
  const normalized = category.trim().toUpperCase()
  return normalized.length > 0 && normalized !== "INDEX"
}

/** Display order for focus crime charts and PPO crime profiles. */
export const INDEX_FOCUS_CRIME_ORDER = [
  "Murder",
  "Homicide",
  "Physical Injury",
  "Rape",
  "Theft",
  "Robbery",
  "Carnapping MC",
  "Carnapping MV",
  "SP Complex",
] as const

/** Always included in focus crime views even when count is zero in both periods. */
export const INDEX_FOCUS_CRIME_ALWAYS = INDEX_FOCUS_CRIME_ORDER

export function normalizeCrimeName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

export function crimeNamesMatch(left: string, right: string) {
  return normalizeCrimeName(left).toUpperCase() === normalizeCrimeName(right).toUpperCase()
}

function focusCrimeOrderIndex(crime: string) {
  const index = INDEX_FOCUS_CRIME_ORDER.findIndex((item) => crimeNamesMatch(item, crime))
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

export function compareFocusCrimeOrder(left: string, right: string) {
  const leftIndex = focusCrimeOrderIndex(left)
  const rightIndex = focusCrimeOrderIndex(right)
  if (leftIndex !== rightIndex) return leftIndex - rightIndex
  return left.localeCompare(right)
}

/** Builds a catalog with focus crimes first (fixed order), then any extras alphabetically. */
export function buildFocusCrimeCatalogFromNames(additionalNames: string[]): string[] {
  const byKey = new Map<string, string>()

  for (const crime of INDEX_FOCUS_CRIME_ORDER) {
    const normalized = normalizeCrimeName(crime)
    byKey.set(normalized.toUpperCase(), normalized)
  }

  for (const name of additionalNames) {
    const normalized = normalizeCrimeName(name)
    if (!normalized) continue
    byKey.set(normalized.toUpperCase(), normalized)
  }

  const ordered: string[] = []
  const seen = new Set<string>()

  for (const crime of INDEX_FOCUS_CRIME_ORDER) {
    const key = normalizeCrimeName(crime).toUpperCase()
    ordered.push(byKey.get(key) ?? normalizeCrimeName(crime))
    seen.add(key)
  }

  const extras = [...byKey.entries()]
    .filter(([key]) => !seen.has(key))
    .map(([, label]) => label)
    .sort((left, right) => left.localeCompare(right))

  return [...ordered, ...extras]
}
