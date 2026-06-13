"use client"

import { refreshPatrolInterventionData } from "@/app/(dashboard)/police-intervention/actions"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"

export function PoliceInterventionRefreshButton() {
  return (
    <DashboardRefreshButton
      refreshAction={refreshPatrolInterventionData}
      label="Refresh counts"
      pendingLabel="Refreshing…"
    />
  )
}
