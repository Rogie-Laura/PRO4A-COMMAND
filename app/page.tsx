import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { LeadershipList } from "@/components/dashboard/leadership-list"
import { RankChart } from "@/components/dashboard/rank-chart"
import { UnitTable } from "@/components/dashboard/unit-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export default async function DashboardPage() {
  const data = await getPersonnelAnalytics()
  const updated = new Date(data.lastUpdated).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <DashboardLayout
      title="Personnel Dashboard"
      description={`PRO CALABARZON — synced from Google Sheets · ${updated}`}
    >
      <div className="space-y-6">
        <KpiCards metrics={data.kpis} />

        <div className="grid gap-6 lg:grid-cols-3">
          <RankChart data={data.rankChart} />
          <LeadershipList rows={data.leadership} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <BreakdownCard
            title="Gender Breakdown"
            description="Male vs female personnel distribution"
            items={data.genderStats}
          />
          <UnitTable rows={data.unitRows} />
        </div>

        <BreakdownCard
          title="Personnel Status"
          description="Current duty and assignment status"
          items={data.statusStats}
        />
      </div>
    </DashboardLayout>
  )
}
