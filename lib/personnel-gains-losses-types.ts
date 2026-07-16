export type StrengthCounts = {
  pco: number
  pnco: number
  nup: number
  total: number
}

export type PersonnelGainLossLine = {
  category: string
  counts: StrengthCounts
}

export type PersonnelStrengthSnapshot = {
  asOf: string
  counts: StrengthCounts
}

export type PersonnelGainsLosses = {
  dataReady: boolean
  title: string
  opening: PersonnelStrengthSnapshot | null
  gains: PersonnelGainLossLine[]
  losses: PersonnelGainLossLine[]
  closing: PersonnelStrengthSnapshot | null
}
