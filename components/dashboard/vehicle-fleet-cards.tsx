import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { VehicleFleetSummary } from "@/lib/mobility-types"

type VehicleFleetCardsProps = {
  fleet: VehicleFleetSummary
}

export function VehicleFleetCards({ fleet }: VehicleFleetCardsProps) {
  const total = fleet.operational + fleet.nonOperational

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardDescription>Operational Vehicles</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
            {fleet.operational.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Non-operational</span>
            <span className="font-semibold tabular-nums">
              {fleet.nonOperational.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fleet total</span>
            <span className="font-semibold tabular-nums">{total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vehicle Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fleet.byType.length === 0 ? (
            <p className="text-xs text-muted-foreground">No vehicle type data yet.</p>
          ) : (
            fleet.byType.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.count.toLocaleString()} · {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-1.5" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vehicle Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fleet.byStatus.length === 0 ? (
            <p className="text-xs text-muted-foreground">No vehicle status data yet.</p>
          ) : (
            fleet.byStatus.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.count.toLocaleString()} · {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-1.5" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
