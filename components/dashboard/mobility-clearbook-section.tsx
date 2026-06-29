import { FirearmsSourceChart } from "@/components/dashboard/firearms-source-chart"
import { MobilityClassificationSection } from "@/components/dashboard/mobility-classification-section"
import { MobilityConditionChart } from "@/components/dashboard/mobility-condition-chart"
import { MobilityPatrolRecapSection } from "@/components/dashboard/mobility-patrol-recap-section"
import { MobilityQuicklookSection } from "@/components/dashboard/mobility-quicklook-section"
import { MobilityUnitCards } from "@/components/dashboard/mobility-unit-cards"
import { MobilityWheelCountSection } from "@/components/dashboard/mobility-wheel-count-section"
import { VehicleFleetCards } from "@/components/dashboard/vehicle-fleet-cards"
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
  const workbook = data.workbook

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
              Tap unit for status, vehicle types, and station breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <MobilityUnitCards units={units} workbook={workbook} />
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

      {workbook?.perClassification ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MobilityClassificationSection data={workbook.perClassification} />
          {workbook.wheelCounts ? (
            <MobilityWheelCountSection data={workbook.wheelCounts} />
          ) : null}
        </div>
      ) : null}

      {workbook?.quicklook ? <MobilityQuicklookSection data={workbook.quicklook} /> : null}

      {workbook?.patrolRecap ? <MobilityPatrolRecapSection data={workbook.patrolRecap} /> : null}

      {data.fleet.byType.length > 0 ? <VehicleFleetCards fleet={data.fleet} /> : null}
    </div>
  )
}
