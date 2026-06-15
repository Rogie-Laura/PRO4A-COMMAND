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
          sourceLabel="Mobility tab"
          syncDescription="synced from Google Sheet (cached until you refresh)"
        />
        <MobilityRefreshButton />
      </div>

      <TotalVehiclesSection
        total={data.totalVehicles}
        offices={data.officeBreakdown}
        ownership={data.ownershipDistribution}
        condition={data.conditionDistribution}
        fleet={data.fleet}
        dataReady={data.dataReady}
      />
    </div>
  )
}
