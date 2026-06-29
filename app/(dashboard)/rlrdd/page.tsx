import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { RlrddPageContent } from "@/components/dashboard/rlrdd-page-content"

export default function RlrddPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <RlrddPageContent />
    </Suspense>
  )
}
