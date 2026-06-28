"use server"

import type { CrimePeriodRange, CrimeComparativeResult } from "@/lib/crime-comparative"
import { compareIndexCrimePeriods } from "@/lib/crime-records"

export async function compareCrimePeriodsAction(
  periodA: CrimePeriodRange,
  periodB: CrimePeriodRange,
): Promise<CrimeComparativeResult> {
  if (!periodA.start || !periodA.end || !periodB.start || !periodB.end) {
    throw new Error("Kailangan ang start at end date para sa parehong period.")
  }

  if (periodA.start > periodA.end || periodB.start > periodB.end) {
    throw new Error("Ang start date ay dapat mas maaga kaysa end date.")
  }

  return compareIndexCrimePeriods(periodA, periodB)
}
