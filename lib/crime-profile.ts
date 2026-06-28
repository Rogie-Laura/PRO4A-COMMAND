import type { CountItem } from "@/lib/personnel-types"

export type CrimeFocusProfileComparison = {
  periodA: number
  periodB: number
  change: number
  changePct: number | null
  changeDirection: "up" | "down" | "flat"
}

export type CrimeFocusProfileData = {
  crime: string
  periodALabel: string
  periodBLabel: string
  comparison: CrimeFocusProfileComparison
  typeofPlaceBreakdown: CountItem[]
  ppoDistribution: CountItem[]
  caseStatusBreakdown: CountItem[]
}
