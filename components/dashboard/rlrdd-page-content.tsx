import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { RlrddModulesCarousel } from "@/components/dashboard/rlrdd-modules-carousel"
import { getFirearmsAnalytics } from "@/lib/firearms-records"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export async function RlrddPageContent() {
  const [firearms, mobility] = await Promise.all([
    getFirearmsAnalytics(),
    getMobilityAnalytics(),
  ])

  const lastUpdated = [firearms.lastUpdated, mobility.lastUpdated].sort().reverse()[0]
  const sourceLabel =
    firearms.dataReady && mobility.dataReady
      ? "firearms.xlsx · Clearbook upload"
      : firearms.dataReady
        ? "firearms.xlsx upload"
        : mobility.dataReady
          ? "Clearbook Excel upload"
          : "Google Sheet"
  const syncDescription =
    firearms.dataReady || mobility.dataReady
      ? "synced from uploaded workbooks"
      : "synced from Google Sheet (cached until you refresh)"

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={lastUpdated}
        sourceLabel={sourceLabel}
        syncDescription={syncDescription}
      />

      <RlrddModulesCarousel firearms={firearms} mobility={mobility} />
    </div>
  )
}
