import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { PersonnelActivityContent } from "@/components/dashboard/personnel-activity-content"

export default function ActivityPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <PersonnelActivityContent />
    </Suspense>
  )
}
