import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export async function PersonnelUsersContent() {
  const data = await getPersonnelAnalytics()

  return (
    <div className="space-y-6">
      <LeadershipSection leadership={data.leadership} />
      <UnitTable rows={data.unitRows} />
    </div>
  )
}
