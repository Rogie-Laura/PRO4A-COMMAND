"use client"

import { MobilityBarChartCard } from "@/components/dashboard/mobility-bar-chart-card"
import type { VehicleWheelCountSummary } from "@/lib/mobility-types"

type MobilityWheelCountSectionProps = {
  data: VehicleWheelCountSummary
}

export function MobilityWheelCountSection({ data }: MobilityWheelCountSectionProps) {
  const chartData = [
    { name: "4-Wheeled", count: data.totals.fourWheeled },
    { name: "2-Wheeled", count: data.totals.twoWheeled },
    { name: "6-Wheeled", count: data.totals.sixWheeled },
    { name: "Bike", count: data.totals.bike },
  ]

  return (
    <MobilityBarChartCard
      title="2 · 4 · 6 Wheeled"
      description={`Wheel configuration · Total ${data.totals.total.toLocaleString()}`}
      data={chartData}
    />
  )
}
