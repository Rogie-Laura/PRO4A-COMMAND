import { CrimeMonthlyChart } from "@/components/dashboard/crime-monthly-chart"
import { CrimePpoDistribution } from "@/components/dashboard/crime-ppo-distribution"
import { CrimeTotalVolumeCard } from "@/components/dashboard/crime-total-volume-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CrimeAnalytics } from "@/lib/crime-types"

type CrimeIndexPanelProps = {
  data: CrimeAnalytics
}

export function CrimeIndexPanel({ data }: CrimeIndexPanelProps) {
  const stats = data.indexCrime

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <CrimeTotalVolumeCard
          stats={stats}
          title="Index Crime Volume"
          subtitle="Total index crimes (category = INDEX)"
        />

        <Card className="gap-0 py-0">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">Index Crime by PPO</CardTitle>
            <CardDescription>Distribution per provincial office</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <CrimePpoDistribution items={stats.ppoBreakdown} total={stats.totalVolume} />
          </CardContent>
        </Card>
      </div>

      <CrimeMonthlyChart data={stats.monthlyBreakdown} />
    </div>
  )
}
