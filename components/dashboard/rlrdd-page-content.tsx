import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { RlrddModulesCarousel } from "@/components/dashboard/rlrdd-modules-carousel"
import { getFirearmsAnalytics } from "@/lib/firearms-records"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export async function RlrddPageContent() {
  const [firearms, mobility] = await Promise.all([
    getFirearmsAnalytics(),
    getMobilityAnalytics(),
  ])

  const lastUpdated =
    firearms.dataReady && firearms.lastUpdated > mobility.lastUpdated
      ? firearms.lastUpdated
      : mobility.lastUpdated

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={lastUpdated}
        sourceLabel={firearms.dataReady ? "firearms.xlsx upload" : "Mobility tab"}
        syncDescription={
          firearms.dataReady
            ? "synced from uploaded firearms workbook"
            : "synced from Google Sheet (cached until you refresh)"
        }
      />

      <RlrddModulesCarousel firearms={firearms} mobility={mobility} />
    </div>
  )
}
