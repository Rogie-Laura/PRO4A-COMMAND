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

const INDEX_FOCUS_CRIME_DB_ALIASES: Record<(typeof INDEX_FOCUS_CRIME_ORDER)[number], readonly string[]> = {
  Murder: ["MURDER"],
  Homicide: ["HOMICIDE"],
  "Physical Injury": ["PHY INJ", "PHYSICAL INJURY", "PHYSICAL INJ"],
  Rape: ["RAPE"],
  Theft: ["THEFT"],
  Robbery: ["ROBBERY"],
  "Carnapping MC": ["CARNAP MC", "CARNAPPING MC"],
  "Carnapping MV": ["CARNAP MV", "CARNAPPING MV"],
  "SP Complex": ["SP COMPLEX", "S.P. COMPLEX"],
}

const FOCUS_CRIME_ALIAS_MAP = buildFocusCrimeAliasMap()

function buildFocusCrimeAliasMap() {
  const map = new Map<string, (typeof INDEX_FOCUS_CRIME_ORDER)[number]>()

  for (const canonical of INDEX_FOCUS_CRIME_ORDER) {
    map.set(normalizeCrimeName(canonical).toUpperCase(), canonical)
    for (const alias of INDEX_FOCUS_CRIME_DB_ALIASES[canonical]) {
      map.set(normalizeCrimeName(alias).toUpperCase(), canonical)
    }
  }

  return map
}

export function normalizeCrimeName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

export function crimeNamesMatch(left: string, right: string) {
  return normalizeCrimeName(left).toUpperCase() === normalizeCrimeName(right).toUpperCase()
}

/** Maps raw DB/upload crime labels to a canonical focus crime name. */
export function resolveCanonicalFocusCrimeName(raw: string): string | null {
  const key = normalizeCrimeName(raw).toUpperCase()
  if (!key) return null
  return FOCUS_CRIME_ALIAS_MAP.get(key) ?? null
}

export function getIndexFocusCrimeCatalog(): string[] {
  return [...INDEX_FOCUS_CRIME_ORDER]
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

/** @deprecated Prefer getIndexFocusCrimeCatalog(). Kept for stored analytics compatibility. */
export function buildFocusCrimeCatalogFromNames(_additionalNames: string[]): string[] {
  return getIndexFocusCrimeCatalog()
}
