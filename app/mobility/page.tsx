import { TotalVehiclesSection } from "@/components/dashboard/total-vehicles-section"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export default async function MobilityPage() {
  const data = await getMobilityAnalytics()

  return (
    <DashboardLayout
      title="Mobility"
      description="Regional fleet registry and vehicle distribution"
    >
      <TotalVehiclesSection
        total={data.totalVehicles}
        offices={data.officeBreakdown}
        ownership={data.ownershipDistribution}
        condition={data.conditionDistribution}
        fleet={data.fleet}
        dataReady={data.dataReady}
      />
    </DashboardLayout>
  )
}
