import { DashboardLayout } from "@/components/dashboard-layout"
import { DeviceBreakdown } from "@/components/dashboard/device-breakdown"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TopPages } from "@/components/dashboard/top-pages"

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Real-time analytics overview for PRO4A COMMAND"
    >
      <div className="space-y-6">
        <KpiCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <OverviewChart />
          <RecentActivity />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <DeviceBreakdown />
          <TopPages />
        </div>
      </div>
    </DashboardLayout>
  )
}
