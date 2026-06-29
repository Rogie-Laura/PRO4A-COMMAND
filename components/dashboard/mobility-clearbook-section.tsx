import { FirearmsSourceChart } from "@/components/dashboard/firearms-source-chart"
import { MobilityConditionChart } from "@/components/dashboard/mobility-condition-chart"
import { MobilityUnitCards } from "@/components/dashboard/mobility-unit-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  aggregateMobilitySourceBreakdown,
  aggregateMobilityStatusBreakdown,
} from "@/lib/mobility-clearbook-analytics"
import type { MobilityAnalytics } from "@/lib/mobility-types"

type MobilityClearbookSectionProps = {
  data: MobilityAnalytics
}

export function MobilityClearbookSection({ data }: MobilityClearbookSectionProps) {
  const units = data.clearbookUnits

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-primary/80">
              {data.totalVehicles.label}
            </CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {data.totalVehicles.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">Motor Vehicles CLEARBOOK</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.totalVehicles.detail}</p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Vehicle Distribution</CardTitle>
            <CardDescription className="text-xs">
              RHQ · Cavite · Laguna · Batangas · Rizal · Quezon · RMFB
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <MobilityUnitCards units={units} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FirearmsSourceChart
          source={aggregateMobilitySourceBreakdown(units)}
          categoryLabel="Vehicles"
        />
        <MobilityConditionChart status={aggregateMobilityStatusBreakdown(units)} />
      </div>
    </div>
  )
}
