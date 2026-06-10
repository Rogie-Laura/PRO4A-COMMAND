import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { MobilityPageContent } from "@/components/dashboard/mobility-page-content"

export default function MobilityPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <MobilityPageContent />
    </Suspense>
  )
}
