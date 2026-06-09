import { LeadershipList } from "@/components/dashboard/leadership-list"
import { UnitTable } from "@/components/dashboard/unit-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export default async function UsersPage() {
  const data = await getPersonnelAnalytics()

  return (
    <DashboardLayout
      title="Personnel"
      description="Leadership roster and unit headcount from Google Sheets"
    >
      <div className="space-y-6">
        <LeadershipList rows={data.leadership} />
        <UnitTable rows={data.unitRows} />
      </div>
    </DashboardLayout>
  )
}
