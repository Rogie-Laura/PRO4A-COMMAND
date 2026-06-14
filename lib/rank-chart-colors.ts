import { PCO_RANK_ORDER, PNCO_RANK_ORDER } from "@/lib/rank-config"

export type RankChartVariant = "pco" | "pnco"

export type RankChartColorStop = {
  base: string
  highlight: string
}

/** PCO: command gold at top ranks → cool blues at junior officer ranks. */
const PCO_RANK_COLORS: Record<string, RankChartColorStop> = {
  PBGEN: { base: "oklch(0.68 0.17 78)", highlight: "oklch(0.78 0.14 82)" },
  PCOL: { base: "oklch(0.64 0.16 62)", highlight: "oklch(0.74 0.13 68)" },
  PLTCOL: { base: "oklch(0.62 0.14 48)", highlight: "oklch(0.72 0.11 52)" },
  PMAJ: { base: "oklch(0.58 0.13 35)", highlight: "oklch(0.68 0.10 40)" },
  PCPT: { base: "oklch(0.58 0.14 195)", highlight: "oklch(0.68 0.11 200)" },
  PLT: { base: "oklch(0.56 0.13 235)", highlight: "oklch(0.66 0.10 240)" },
  PSINSP: { base: "oklch(0.54 0.12 285)", highlight: "oklch(0.64 0.09 290)" },
}

/** PNCO: fresh teals at entry ranks → deep violet and gold at senior NCO ranks. */
const PNCO_RANK_COLORS: Record<string, RankChartColorStop> = {
  Pat: { base: "oklch(0.72 0.11 205)", highlight: "oklch(0.82 0.08 210)" },
  PCpl: { base: "oklch(0.66 0.14 245)", highlight: "oklch(0.76 0.11 250)" },
  PSSg: { base: "oklch(0.62 0.15 265)", highlight: "oklch(0.72 0.12 270)" },
  PMSg: { base: "oklch(0.60 0.16 295)", highlight: "oklch(0.70 0.13 300)" },
  PSMS: { base: "oklch(0.62 0.15 330)", highlight: "oklch(0.72 0.12 335)" },
  PCMS: { base: "oklch(0.58 0.14 155)", highlight: "oklch(0.68 0.11 160)" },
  PEMS: { base: "oklch(0.66 0.15 82)", highlight: "oklch(0.76 0.12 86)" },
}

const PCO_FALLBACK: RankChartColorStop[] = [
  { base: "oklch(0.62 0.14 78)", highlight: "oklch(0.72 0.11 82)" },
  { base: "oklch(0.58 0.13 200)", highlight: "oklch(0.68 0.10 205)" },
  { base: "oklch(0.54 0.12 250)", highlight: "oklch(0.64 0.09 255)" },
]

const PNCO_FALLBACK: RankChartColorStop[] = [
  { base: "oklch(0.66 0.13 210)", highlight: "oklch(0.76 0.10 215)" },
  { base: "oklch(0.60 0.14 280)", highlight: "oklch(0.70 0.11 285)" },
  { base: "oklch(0.64 0.13 330)", highlight: "oklch(0.74 0.10 335)" },
]

export function getRankChartColor(
  rank: string,
  variant: RankChartVariant,
  index = 0,
): RankChartColorStop {
  const palette = variant === "pco" ? PCO_RANK_COLORS : PNCO_RANK_COLORS
  const fallback = variant === "pco" ? PCO_FALLBACK : PNCO_FALLBACK
  return palette[rank] ?? fallback[index % fallback.length]
}

export function getRankChartOrder(variant: RankChartVariant) {
  return variant === "pco" ? PCO_RANK_ORDER : PNCO_RANK_ORDER
}
