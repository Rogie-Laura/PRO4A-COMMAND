import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { TerrorismThreatLevelCard } from "@/components/dashboard/terrorism-threat-level-card"
import { getTerrorismThreatAnalytics } from "@/lib/terrorism-threat-records"

export async function RidPageContent() {
  const analytics = await getTerrorismThreatAnalytics()

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={analytics.lastUpdated}
        sourceLabel={analytics.dataReady ? "R2 workbook upload" : "R2 upload"}
        syncDescription={
          analytics.dataReady
            ? `synced from ${analytics.fileName}`
            : "Mag-upload ng R2 for PRO4A COMMAND.xlsx sa Upload File"
        }
      />

      <TerrorismThreatLevelCard analytics={analytics} />
    </div>
  )
}
