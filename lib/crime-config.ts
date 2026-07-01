export const CRIME_UPLOAD_CATEGORIES = ["INDEX", "NON INDEX"] as const

export type CrimeUploadCategory = (typeof CRIME_UPLOAD_CATEGORIES)[number]

export function normalizeUploadCategory(value: string): CrimeUploadCategory | null {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ")

  if (normalized === "INDEX") {
    return "INDEX"
  }

  if (normalized === "NON INDEX" || normalized === "NON-INDEX" || normalized === "NONINDEX") {
    return "NON INDEX"
  }

  return null
}

export function isAllowedUploadCategory(value: string) {
  return normalizeUploadCategory(value) !== null
}

export function isIndexCrimeCategory(category: string) {
  return normalizeUploadCategory(category) === "INDEX"
}

export function isNonIndexCrimeCategory(category: string) {
  return normalizeUploadCategory(category) === "NON INDEX"
}

export function normalizeCaseStatus(value: string) {
  return value.trim().replace(/\s+/g, " ")
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

function resolveCirasFocusCrimeName(key: string): (typeof INDEX_FOCUS_CRIME_ORDER)[number] | null {
  if (key.includes("ROBBERY")) return "Robbery"
  if (key.includes("CARNAPPING") && (key.includes(" MC") || /\bMC\b/.test(key))) {
    return "Carnapping MC"
  }
  if (key.includes("CARNAPPING") && (key.includes(" MV") || /\bMV\b/.test(key))) {
    return "Carnapping MV"
  }
  if (key.includes("RAPE")) return "Rape"
  if (key.includes("MURDER")) return "Murder"
  if (key.includes("HOMICIDE") || key.includes("PARRICIDE") || key.includes("INFANTICIDE")) {
    return "Homicide"
  }
  if (key.includes("PHYSICAL INJUR") || key.includes("PHY INJ") || key.includes("MALTREATMENT")) {
    return "Physical Injury"
  }
  if (key.includes("THEFT")) return "Theft"
  if (key.includes("SP COMPLEX") || key.includes("S.P. COMPLEX")) return "SP Complex"

  return null
}

/** Maps raw DB/upload crime labels to a canonical focus crime name. */
export function resolveCanonicalFocusCrimeName(raw: string): string | null {
  const key = normalizeCrimeName(raw).toUpperCase()
  if (!key) return null

  const exact = FOCUS_CRIME_ALIAS_MAP.get(key)
  if (exact) return exact

  return resolveCirasFocusCrimeName(key)
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
