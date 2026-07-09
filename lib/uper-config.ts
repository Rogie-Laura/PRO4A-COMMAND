export const UPER_RATING_LABELS: Record<string, string> = {
  O: "Outstanding",
  VS: "Very Satisfactory",
  S: "Satisfactory",
  MS: "Moderately Satisfactory",
  P: "Poor",
}

export function formatUperRating(code: string) {
  const normalized = code.trim().toUpperCase()
  return UPER_RATING_LABELS[normalized] ?? normalized
}
