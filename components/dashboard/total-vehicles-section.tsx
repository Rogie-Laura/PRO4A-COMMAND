import { MobilityClearbookSection } from "@/components/dashboard/mobility-clearbook-section"
import { MobilityOfficeCards } from "@/components/dashboard/mobility-office-cards"
import { VehicleDistributionSection } from "@/components/dashboard/vehicle-distribution-section"
import { VehicleFleetCards } from "@/components/dashboard/vehicle-fleet-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { MobilityAnalytics } from "@/lib/mobility-types"

type TotalVehiclesSectionProps = {
  analytics: MobilityAnalytics
}

export function TotalVehiclesSection({ analytics }: TotalVehiclesSectionProps) {
  if (analytics.dataSource === "clearbook-upload" && analytics.clearbookUnits.length > 0) {
    return <MobilityClearbookSection data={analytics} />
  }

  const {
    totalVehicles,
    officeBreakdown,
    ownershipDistribution,
    conditionDistribution,
    fleet,
    dataReady,
  } = analytics

  return (
    <div className="space-y-4">
      {!dataReady && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang vehicle data pa. I-upload ang Clearbook Excel sa Settings (worksheet na
            `CLEARBOOK`) o i-sync ang Mobility Google Sheet tab.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-primary/80">
              {totalVehicles.label}
            </CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {totalVehicles.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{totalVehicles.detail}</p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <MobilityOfficeCards offices={officeBreakdown} />
          </CardContent>
        </Card>
      </div>

      <VehicleDistributionSection ownership={ownershipDistribution} condition={conditionDistribution} />

      <VehicleFleetCards fleet={fleet} />
    </div>
  )
}
