import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { RpsmdPageContent } from "@/components/dashboard/rpsmd-page-content"

export default function RpsmdPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <RpsmdPageContent />
    </Suspense>
  )
}
