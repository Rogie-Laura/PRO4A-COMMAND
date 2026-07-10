import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { TerrorismThreatLevelCard } from "@/components/dashboard/terrorism-threat-level-card"
import { getTerrorismThreatAnalytics } from "@/lib/terrorism-threat-records"

export async function RidPageContent() {
  const analytics = await getTerrorismThreatAnalytics()

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={analytics.lastUpdated}
        sourceLabel={analytics.dataReady ? "Threat level upload" : "Threat level upload"}
        syncDescription={
          analytics.dataReady
            ? `synced from ${analytics.fileName}`
            : "Mag-upload ng TERRORISM THREAT LEVEL.xlsx sa Upload File"
        }
      />

      <TerrorismThreatLevelCard analytics={analytics} />
    </div>
  )
}
