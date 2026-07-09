export const UPER_RATING_LABELS: Record<string, string> = {
  O: "Outstanding",
  VS: "Very Satisfactory",
  S: "Satisfactory",
  MS: "Moderately Satisfactory",
  P: "Poor",
}

const ORDINAL_SUFFIXES: Record<number, string> = {
  1: "st",
  2: "nd",
  3: "rd",
}

export function formatOrdinalRank(rankNumber: number) {
  const mod100 = rankNumber % 100
  if (mod100 >= 11 && mod100 <= 13) {
    return `${rankNumber}th`
  }

  const suffix = ORDINAL_SUFFIXES[rankNumber % 10] ?? "th"
  return `${rankNumber}${suffix}`
}

export function formatUperRating(code: string) {
  const normalized = code.trim()
  const upper = normalized.toUpperCase()
  return UPER_RATING_LABELS[upper] ?? normalized
}
