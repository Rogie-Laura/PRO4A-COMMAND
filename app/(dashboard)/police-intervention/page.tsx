import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { PoliceInterventionContent } from "@/components/dashboard/police-intervention-content"

export default function PoliceInterventionPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <PoliceInterventionContent />
    </Suspense>
  )
}
