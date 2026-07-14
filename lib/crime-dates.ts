export function parseCrimeRecordDate(value: string | null | undefined): Date | null {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
  }

  const parts = trimmed.split("/")
  if (parts.length !== 3) return null

  const month = Number.parseInt(parts[0] ?? "", 10)
  const day = Number.parseInt(parts[1] ?? "", 10)
  let year = Number.parseInt(parts[2] ?? "", 10)

  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) {
    return null
  }

  if (year < 100) {
    year += 2000
  }

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime()) || date.getMonth() !== month - 1) {
    return null
  }

  return date
}

export function toIsoDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Same day-of-month in the previous calendar month, capped at that month's last day. */
export function getMatchingDayInPreviousMonth(referenceDate: Date): Date {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const day = referenceDate.getDate()
  const lastDayOfPreviousMonth = new Date(year, month, 0).getDate()

  return new Date(year, month - 1, Math.min(day, lastDayOfPreviousMonth))
}

export function endOfMonthFromMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return toIsoDateString(new Date(year, month - 1, lastDay))
}

export function formatCrimeDateLabel(isoDate: string) {
  const parsed = parseCrimeRecordDate(isoDate)
  if (!parsed) return isoDate

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

export function formatCrimeDateRangeLabel(startIso: string, endIso: string) {
  return `${formatCrimeDateLabel(startIso)} – ${formatCrimeDateLabel(endIso)}`
}

export function getEffectiveCrimeDate(dateCommitted: string | null): string | null {
  const committed = dateCommitted?.trim()
  return committed ? committed.slice(0, 10) : null
}

export function parseCrimeDisplayDate(value: string | null | undefined): Date | null {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) return null

  const iso = parseCrimeRecordDate(trimmed)
  if (iso) return iso

  const parsed = Date.parse(trimmed)
  if (Number.isNaN(parsed)) return null

  return startOfDay(new Date(parsed))
}

export function isValidIsoDateRange(startIso: string, endIso: string) {
  return Boolean(startIso && endIso && startIso <= endIso)
}

export function isIsoDateInRange(isoDate: string, startIso: string, endIso: string) {
  return isoDate >= startIso && isoDate <= endIso
}
