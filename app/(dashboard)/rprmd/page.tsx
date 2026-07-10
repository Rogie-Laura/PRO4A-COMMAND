import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { PersonnelStatsContent } from "@/components/dashboard/personnel-stats-content"

export const maxDuration = 60

export default function RprmdPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <PersonnelStatsContent />
    </Suspense>
  )
}
