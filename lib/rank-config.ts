export const PCO_RANK_ORDER = [
  "PBGEN",
  "PCOL",
  "PLTCOL",
  "PMAJ",
  "PCPT",
  "PLT",
  "PSINSP",
] as const

export const PNCO_RANK_ORDER = [
  "Pat",
  "PCpl",
  "PSSg",
  "PMSg",
  "PSMS",
  "PCMS",
  "PEMS",
] as const

export const PCO_RANKS = new Set<string>(PCO_RANK_ORDER)
export const PNCO_RANKS = new Set<string>(PNCO_RANK_ORDER)

export const NUP_RANK = "NUP"

export function isNup(rank: string) {
  return rank.trim().toUpperCase() === NUP_RANK
}

export function isPco(rank: string) {
  return PCO_RANKS.has(rank.trim())
}

export function isPnco(rank: string) {
  return PNCO_RANKS.has(rank.trim())
}

/** Display scale per rank insignia — lower ranks with fewer suns are scaled down. */
const RANK_INSIGNIA_SCALE: Record<string, number> = {
  PLTCOL: 0.68,
}

export function getRankInsigniaScale(rank: string) {
  return RANK_INSIGNIA_SCALE[rank.trim().toUpperCase()] ?? 1
}

const COLONEL_RANKS = new Set(["PCOL", "PLTCOL"])

/** Light-mode insignia tint — colonel suns read muddy when over-gold. */
export function getRankInsigniaTint(rank: string): "colonel" | "general" | "default" {
  const normalized = rank.trim().toUpperCase()
  if (COLONEL_RANKS.has(normalized)) return "colonel"
  if (normalized === "PBGEN") return "general"
  return "default"
}
