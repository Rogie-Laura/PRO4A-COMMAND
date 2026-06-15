"use client"

import { refreshMobilityData } from "@/app/(dashboard)/mobility/actions"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"

export function MobilityRefreshButton() {
  return <DashboardRefreshButton refreshAction={refreshMobilityData} />
}
