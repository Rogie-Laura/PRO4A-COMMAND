import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
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

  const lastUpdated =
    [uperAnalytics.lastUpdated, alertLevel.updatedAt, threatAnalytics.lastUpdated]
      .filter(Boolean)
      .sort()
      .at(-1) ?? new Date().toISOString()

  const syncParts = [
    uperAnalytics.dataReady ? `Rank from ${uperAnalytics.fileName}` : null,
    `Alert level: ${alertLevel.level}`,
    threatAnalytics.dataReady ? `Threat from ${threatAnalytics.fileName}` : null,
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={lastUpdated}
        sourceLabel="PRO4A Status"
        syncDescription={
          syncParts.length > 0 ? syncParts.join(" · ") : "Regional status overview for CALABARZON"
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <UperCurrentRankingCard analytics={uperAnalytics} compact />
        <AlertLevelCard setting={alertLevel} compact />
        <TerrorismThreatLevelCard analytics={threatAnalytics} compact />
      </div>
    </div>
  )
}
