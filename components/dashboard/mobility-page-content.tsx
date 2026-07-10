import { MobilityRefreshButton } from "@/components/dashboard/mobility-refresh-button"
import { TotalVehiclesSection } from "@/components/dashboard/total-vehicles-section"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export async function MobilityPageContent() {
  const data = await getMobilityAnalytics()

  return (
    <div className="space-y-4">
      {data.dataSource === "google-sheet" ? (
        <div className="flex justify-end">
          <MobilityRefreshButton />
        </div>
      ) : null}

      <TotalVehiclesSection analytics={data} />
    </div>
  )
}
