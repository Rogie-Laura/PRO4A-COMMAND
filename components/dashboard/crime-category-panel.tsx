import { CrimeMonthlyChart } from "@/components/dashboard/crime-monthly-chart"
import { CrimePpoDistribution } from "@/components/dashboard/crime-ppo-distribution"
import { CrimeTotalVolumeCard } from "@/components/dashboard/crime-total-volume-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CrimeCategoryStats } from "@/lib/crime-types"

type CrimeCategoryPanelProps = {
  stats: CrimeCategoryStats
  variant: "index" | "non-index"
  volumeTitle: string
  volumeSubtitle: string
  ppoTitle: string
  ppoDescription: string
}

export function CrimeCategoryPanel({
  stats,
  variant,
  volumeTitle,
  volumeSubtitle,
  ppoTitle,
  ppoDescription,
}: CrimeCategoryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <CrimeTotalVolumeCard
          stats={stats}
          title={volumeTitle}
          subtitle={volumeSubtitle}
          variant={variant}
        />

        <Card className="gap-0 py-0">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">{ppoTitle}</CardTitle>
            <CardDescription>{ppoDescription}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <CrimePpoDistribution items={stats.ppoBreakdown} total={stats.totalVolume} />
          </CardContent>
        </Card>
      </div>

      <CrimeMonthlyChart data={stats.monthlyBreakdown} variant={variant} />
    </div>
  )
}
