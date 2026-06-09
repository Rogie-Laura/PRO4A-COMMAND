export const PCO_RANKS = new Set([
  "PBGEN",
  "PCOL",
  "PLTCOL",
  "PMAJ",
  "PCPT",
  "PLT",
  "PSINSP",
])

export const PNCO_RANKS = new Set([
  "Pat",
  "PCpl",
  "PSSg",
  "PMSg",
  "PSMS",
  "PCMS",
  "PEMS",
])

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
