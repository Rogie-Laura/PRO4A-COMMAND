import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { PersonnelStatsContent } from "@/components/dashboard/personnel-stats-content"

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <PersonnelStatsContent />
    </Suspense>
  )
}
