import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { Pro4aStatusPageContent } from "@/components/dashboard/pro4a-status-page-content"

export default function Pro4aStatusPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Pro4aStatusPageContent />
    </Suspense>
  )
}
