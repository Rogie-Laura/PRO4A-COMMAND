import { TotalVehiclesSection } from "@/components/dashboard/total-vehicles-section"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export default async function MobilityPage() {
  const data = await getMobilityAnalytics()

  return (
      <TotalVehiclesSection
        total={data.totalVehicles}
        offices={data.officeBreakdown}
        ownership={data.ownershipDistribution}
        condition={data.conditionDistribution}
        fleet={data.fleet}
        dataReady={data.dataReady}
      />
  )
}
