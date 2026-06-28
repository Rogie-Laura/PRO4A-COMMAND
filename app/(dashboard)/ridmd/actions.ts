"use server"

import { isValidIsoDateRange } from "@/lib/crime-dates"
import type { CrimePeriodRange, CrimeComparativeResult, CrimeFocusComparativeRow } from "@/lib/crime-comparative"
import { compareIndexCrimeForPpoByCrimeType, compareIndexCrimePeriods } from "@/lib/crime-records"

export async function compareCrimePeriodsAction(
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeComparativeResult> {
  if (!periodA.start || !periodA.end || !periodB.start || !periodB.end) {
    throw new Error("Kailangan ang start at end date para sa parehong period.")
  }

  if (!isValidIsoDateRange(periodA.start, periodA.end) || !isValidIsoDateRange(periodB.start, periodB.end)) {
    throw new Error("Ang start date ay dapat mas maaga o pantay sa end date at nasa loob ng available data.")
  }

  try {
    return await compareIndexCrimePeriods(periodA, periodB)
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Hindi makumpleto ang comparison. Subukan ulit.",
    )
  }
}

export async function comparePpoCrimeTypesAction(
  ppoCsvName: string,
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeFocusComparativeRow[]> {
  if (!ppoCsvName.trim()) {
    throw new Error("Kailangan ang PPO para sa focus crime profile.")
  }

  if (!periodA.start || !periodA.end || !periodB.start || !periodB.end) {
    throw new Error("Kailangan ang start at end date para sa parehong period.")
  }

  if (!isValidIsoDateRange(periodA.start, periodA.end) || !isValidIsoDateRange(periodB.start, periodB.end)) {
    throw new Error("Ang start date ay dapat mas maaga o pantay sa end date at nasa loob ng available data.")
  }

  try {
    return await compareIndexCrimeForPpoByCrimeType(ppoCsvName, periodA, periodB)
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Hindi ma-load ang focus crime profile. Subukan ulit.",
    )
  }
}
