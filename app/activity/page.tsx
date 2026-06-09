import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export default async function ActivityPage() {
  const data = await getPersonnelAnalytics()

  return (
    <DashboardLayout title="Status" description="Personnel duty and assignment status">
      <BreakdownCard
        title="Personnel Status"
        description="Live count from Google Sheets roster"
        items={data.statusStats}
      />
    </DashboardLayout>
  )
}
