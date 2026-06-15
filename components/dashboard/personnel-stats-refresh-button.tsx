"use client"

import { refreshPersonnelStatsData } from "@/app/(dashboard)/actions"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"

export function PersonnelStatsRefreshButton() {
  return <DashboardRefreshButton refreshAction={refreshPersonnelStatsData} />
}
