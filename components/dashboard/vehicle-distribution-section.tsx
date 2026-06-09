import { VehiclePieCard } from "@/components/dashboard/vehicle-pie-card"
import type { VehicleChartPoint } from "@/lib/mobility-types"

type VehicleDistributionSectionProps = {
  ownership: VehicleChartPoint[]
  condition: VehicleChartPoint[]
}

export function VehicleDistributionSection({
  ownership,
  condition,
}: VehicleDistributionSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <VehiclePieCard
        title="Vehicle Ownership"
        description="Total Organic, Loaned by LGU, and Donated"
        data={ownership}
      />
      <VehiclePieCard
        title="Vehicle Condition"
        description="Serviceable, Unserviceable, and BER"
        data={condition}
      />
    </div>
  )
}
