import { DashboardLayout } from "@/components/dashboard-layout"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function ActivityPage() {
  return (
    <DashboardLayout title="Activity" description="Full event stream and audit log">
      <RecentActivity />
    </DashboardLayout>
  )
}
