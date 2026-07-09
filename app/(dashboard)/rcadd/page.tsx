import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { RcaddPageContent } from "@/components/dashboard/rcadd-page-content"

export default function RcaddPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <RcaddPageContent />
    </Suspense>
  )
}
