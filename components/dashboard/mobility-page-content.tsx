import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { MobilityRefreshButton } from "@/components/dashboard/mobility-refresh-button"
import { TotalVehiclesSection } from "@/components/dashboard/total-vehicles-section"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export async function MobilityPageContent() {
  const data = await getMobilityAnalytics()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DataSyncBanner
          lastUpdated={data.lastUpdated}
          sourceLabel={
            data.dataSource === "clearbook-upload" ? "Clearbook Excel upload" : "Mobility tab"
          }
          syncDescription={
            data.dataSource === "clearbook-upload"
              ? "synced from uploaded CLEARBOOK workbook"
              : "synced from Google Sheet (cached until you refresh)"
          }
        />
        {data.dataSource === "google-sheet" ? <MobilityRefreshButton /> : null}
      </div>

      <TotalVehiclesSection analytics={data} />
    </div>
  )
}
