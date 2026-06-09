import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import { LeadershipList } from "@/components/dashboard/leadership-list"
import { RankChart } from "@/components/dashboard/rank-chart"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export default async function DashboardPage() {
  const data = await getPersonnelAnalytics()

  const totalKpi = data.kpis.find((k) => k.id === "total")

  return (
    <DashboardLayout title="Personnel Stats">
      <div className="space-y-6">
        {totalKpi && (
          <TotalPersonnelSection
            total={totalKpi}
            offices={data.officeBreakdown}
            workforce={data.workforce}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <RankChart data={data.rankChart} />
          <LeadershipList rows={data.leadership} />
        </div>

        <UnitTable rows={data.unitRows} />

        <BreakdownCard
          title="Personnel Status"
          description="Current duty and assignment status"
          items={data.statusStats}
        />
      </div>
    </DashboardLayout>
  )
}
