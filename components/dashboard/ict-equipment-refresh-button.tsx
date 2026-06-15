"use client"

import { refreshIctEquipmentData } from "@/app/(dashboard)/ict-equipment-inventory/actions"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"

export function IctEquipmentRefreshButton() {
  return <DashboardRefreshButton refreshAction={refreshIctEquipmentData} />
}
