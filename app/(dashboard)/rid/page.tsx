import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { RidPageContent } from "@/components/dashboard/rid-page-content"

export default function RidPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <RidPageContent />
    </Suspense>
  )
}
