"use client"

import { MobilityBarChartCard } from "@/components/dashboard/mobility-bar-chart-card"
import type { VehicleClassificationSummary } from "@/lib/mobility-types"

type MobilityClassificationSectionProps = {
  data: VehicleClassificationSummary
}

export function MobilityClassificationSection({ data }: MobilityClassificationSectionProps) {
  const chartData = [
    { name: "Patrol", count: data.totals.patrolVehicle },
    { name: "SUV", count: data.totals.serviceUtility },
    { name: "Truck", count: data.totals.truck },
    { name: "Bus", count: data.totals.bus },
    { name: "SPV", count: data.totals.specialPurpose },
    { name: "Motorcycle", count: data.totals.motorcycle },
    { name: "Bike", count: data.totals.bike },
  ]

  return (
    <MobilityBarChartCard
      title="Per Classification"
      description={
        data.asOf
          ? `Vehicle types as of ${data.asOf} · Total ${data.totals.total.toLocaleString()}`
          : `Vehicle types · Total ${data.totals.total.toLocaleString()}`
      }
      data={chartData}
    />
  )
}
