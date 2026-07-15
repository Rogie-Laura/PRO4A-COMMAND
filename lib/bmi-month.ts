const FILIPINO_MONTHS = [
  "Enero",
  "Pebrero",
  "Marso",
  "Abril",
  "Mayo",
  "Hunyo",
  "Hulyo",
  "Agosto",
  "Setyembre",
  "Oktubre",
  "Nobyembre",
  "Disyembre",
]

/** "2026-06" -> "Hunyo 2026" (Filipino month labels). Pure/client-safe. */
export function formatMonthKeyLabel(monthKey: string | null): string {
  if (!monthKey) return "—"
  const match = monthKey.match(/^(\d{4})-(\d{2})$/)
  if (!match) return monthKey

  const year = match[1]
  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) return monthKey
  return `${FILIPINO_MONTHS[monthIndex]} ${year}`
}
