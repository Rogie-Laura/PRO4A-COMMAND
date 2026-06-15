"use client"

import { refreshHealthAndBmiData } from "@/app/(dashboard)/health-and-bmi/actions"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"

export function HealthAndBmiRefreshButton() {
  return <DashboardRefreshButton refreshAction={refreshHealthAndBmiData} />
}
