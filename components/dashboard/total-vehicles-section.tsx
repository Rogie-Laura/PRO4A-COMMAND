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
  total: MobilityAnalytics["totalVehicles"]
  offices: MobilityAnalytics["officeBreakdown"]
  ownership: MobilityAnalytics["ownershipDistribution"]
  condition: MobilityAnalytics["conditionDistribution"]
  fleet: MobilityAnalytics["fleet"]
  dataReady: boolean
}

export function TotalVehiclesSection({
  total,
  offices,
  ownership,
  condition,
  fleet,
  dataReady,
}: TotalVehiclesSectionProps) {
  return (
    <div className="space-y-4">
      {!dataReady && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang vehicle data sa Mobility sheet pa. Kapag ready na ang Google Sheet tab
            (Mobility), auto-count na ang offices, ownership (Organic/LGU/Donated), at
            condition (Serviceable/Unserviceable/BER).
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-primary/80">
              {total.label}
            </CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {total.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{total.detail}</p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <MobilityOfficeCards offices={offices} />
          </CardContent>
        </Card>
      </div>

      <VehicleDistributionSection ownership={ownership} condition={condition} />

      <VehicleFleetCards fleet={fleet} />
    </div>
  )
}
