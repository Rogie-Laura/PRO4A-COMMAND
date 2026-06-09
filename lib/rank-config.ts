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
