import { AlertLevelCard } from "@/components/dashboard/alert-level-card"
import { PeaceAndOrderSituationCard } from "@/components/dashboard/peace-and-order-situation-card"
import { TerrorismThreatLevelCard } from "@/components/dashboard/terrorism-threat-level-card"
import { UperCurrentRankingCard } from "@/components/dashboard/uper-current-ranking-card"
import { getAlertLevelSetting } from "@/lib/alert-level-records"
import { getCrimeAnalytics } from "@/lib/crime-analytics"
import {
  buildPresetRanges,
  getCrimeDataBounds,
  type CrimeComparativeResult,
} from "@/lib/crime-comparative"
import { compareIndexCrimePeriods } from "@/lib/crime-records"
import { getTerrorismThreatAnalytics } from "@/lib/terrorism-threat-records"
import { getUperAnalytics } from "@/lib/uper-records"

async function loadPeaceAndOrderComparison(): Promise<CrimeComparativeResult | null> {
  try {
    const crime = await getCrimeAnalytics()
    if (!crime.dataReady) return null

    const bounds = getCrimeDataBounds({
      monthlyBreakdown: crime.indexCrime.monthlyBreakdown,
      coveredPeriodStart: crime.indexCrime.coveredPeriodStart,
      coveredPeriodEnd: crime.indexCrime.coveredPeriodEnd,
    })
    if (!bounds) return null

    // Always previous calendar month vs current month, same day cut-off
    // (e.g. data through Jul 9 → Jun 1–9 vs Jul 1–9).
    const { periodA, periodB } = buildPresetRanges("month-vs-last-month", bounds)
    return compareIndexCrimePeriods(periodA, periodB)
  } catch {
    return null
  }
}

export async function Pro4aStatusPageContent() {
  const [uperAnalytics, alertLevel, threatAnalytics, peaceAndOrder] = await Promise.all([
    getUperAnalytics(),
    getAlertLevelSetting(),
    getTerrorismThreatAnalytics(),
    loadPeaceAndOrderComparison(),
  ])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <UperCurrentRankingCard analytics={uperAnalytics} compact />
        <AlertLevelCard setting={alertLevel} compact />
        <TerrorismThreatLevelCard analytics={threatAnalytics} compact />
      </div>

      <PeaceAndOrderSituationCard result={peaceAndOrder} />
    </div>
  )
}
