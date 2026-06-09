export const AGE_BRACKETS = [
  { id: "20-30", label: "20-30", min: 20, max: 30 },
  { id: "31-39", label: "31-39", min: 31, max: 39 },
  { id: "40-50", label: "40-50", min: 40, max: 50 },
  { id: "51-56", label: "51-56", min: 51, max: 56 },
] as const

export const AGE_OTHERS_ID = "others"

export type AgeBracketId = (typeof AGE_BRACKETS)[number]["id"]

export function parseBirthDate(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parts = trimmed.split("/")
  if (parts.length !== 3) return null

  const month = Number(parts[0]) - 1
  const day = Number(parts[1])
  const year = Number(parts[2])

  if (!year || month < 0 || month > 11 || !day) return null

  const date = new Date(year, month, day)
  return Number.isNaN(date.getTime()) ? null : date
}

export function calculateAge(birthDate: Date, asOf = new Date()): number {
  let age = asOf.getFullYear() - birthDate.getFullYear()
  const monthDiff = asOf.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

export function getAgeBracketId(age: number): AgeBracketId | null {
  const bracket = AGE_BRACKETS.find((item) => age >= item.min && age <= item.max)
  return bracket?.id ?? null
}

export function getAgeBracketFromBirthDate(birthDate: string): AgeBracketId | null {
  const parsed = parseBirthDate(birthDate)
  if (!parsed) return null

  return getAgeBracketId(calculateAge(parsed))
}
