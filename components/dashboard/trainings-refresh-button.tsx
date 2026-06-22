"use client"

import { refreshTrainingsData } from "@/app/(dashboard)/trainings-and-education/actions"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"

export function TrainingsRefreshButton() {
  return <DashboardRefreshButton refreshAction={refreshTrainingsData} />
}
