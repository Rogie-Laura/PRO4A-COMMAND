import { CrimePpoDistribution } from "@/components/dashboard/crime-ppo-distribution"
import { CrimeTotalVolumeCard } from "@/components/dashboard/crime-total-volume-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CrimeAnalytics } from "@/lib/crime-types"

type CrimeVolumeSectionProps = {
  data: CrimeAnalytics
}

export function CrimeVolumeSection({ data }: CrimeVolumeSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
      <CrimeTotalVolumeCard data={data} />

      <Card className="gap-0 py-0">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Crime Volume by PPO</CardTitle>
          <CardDescription>Index crime distribution per provincial office</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <CrimePpoDistribution items={data.ppoBreakdown} total={data.totalVolume} />
        </CardContent>
      </Card>
    </div>
  )
}
