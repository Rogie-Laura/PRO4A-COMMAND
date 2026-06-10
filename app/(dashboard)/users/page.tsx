import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export default async function UsersPage() {
  const data = await getPersonnelAnalytics()

  return (
    <div className="space-y-6">
      <LeadershipSection leadership={data.leadership} />
      <UnitTable rows={data.unitRows} />
    </div>
  )
}
