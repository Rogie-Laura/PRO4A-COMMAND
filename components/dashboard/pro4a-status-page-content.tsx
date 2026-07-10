import { AlertLevelCard } from "@/components/dashboard/alert-level-card"
import { TerrorismThreatLevelCard } from "@/components/dashboard/terrorism-threat-level-card"
import { UperCurrentRankingCard } from "@/components/dashboard/uper-current-ranking-card"
import { getAlertLevelSetting } from "@/lib/alert-level-records"
import { getTerrorismThreatAnalytics } from "@/lib/terrorism-threat-records"
import { getUperAnalytics } from "@/lib/uper-records"

export async function Pro4aStatusPageContent() {
  const [uperAnalytics, alertLevel, threatAnalytics] = await Promise.all([
    getUperAnalytics(),
    getAlertLevelSetting(),
    getTerrorismThreatAnalytics(),
  ])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <UperCurrentRankingCard analytics={uperAnalytics} compact />
        <AlertLevelCard setting={alertLevel} compact />
        <TerrorismThreatLevelCard analytics={threatAnalytics} compact />
      </div>
    </div>
  )
}
