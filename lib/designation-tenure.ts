import { parseBirthDate } from "@/lib/age-config"

export type TenureParts = {
  years: number
  months: number
  days: number
  totalDays: number
}

/** Parse designation / promotion style dates: M/D/YYYY or Excel serial string. */
export function parseDesignationDate(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const fromSlash = parseBirthDate(trimmed)
  if (fromSlash) return fromSlash

  const serial = Number(trimmed)
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const parsed = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
    }
  }

  return null
}

export function calculateTenureParts(from: Date, asOf = new Date()): TenureParts {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())

  if (end < start) {
    return { years: 0, months: 0, days: 0, totalDays: 0 }
  }

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months -= 1
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += previousMonth.getDate()
  }

  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000)

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays: Math.max(0, totalDays),
  }
}

/** Example: "1 yr, 3 months, 8 days" */
export function formatTenureLabel(parts: TenureParts): string {
  const chunks: string[] = []

  if (parts.years > 0) {
    chunks.push(`${parts.years} ${parts.years === 1 ? "yr" : "yrs"}`)
  }

  if (parts.months > 0) {
    chunks.push(`${parts.months} ${parts.months === 1 ? "month" : "months"}`)
  }

  if (parts.days > 0 || chunks.length === 0) {
    chunks.push(`${parts.days} ${parts.days === 1 ? "day" : "days"}`)
  }

  return chunks.join(", ")
}

export function formatDesignationDateDisplay(value: string): string {
  const parsed = parseDesignationDate(value)
  if (!parsed) return value.trim() || "—"

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}
