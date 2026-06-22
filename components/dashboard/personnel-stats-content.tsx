import { Suspense } from "react"

import { AdminHoldingSectionLoader } from "@/components/dashboard/admin-holding-section-loader"
import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { DetailedPersonnelSectionsLoader } from "@/components/dashboard/detailed-personnel-sections-loader"
import { PersonnelStatsPrimary } from "@/components/dashboard/personnel-stats-primary"
import { SchoolingSectionsLoader } from "@/components/dashboard/schooling-sections-loader"
import { SectionLoading } from "@/components/dashboard/section-loading"

export function PersonnelStatsContent() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardLoading />}>
        <PersonnelStatsPrimary />
      </Suspense>

      <Suspense fallback={<SectionLoading label="Admin Holding" />}>
        <AdminHoldingSectionLoader />
      </Suspense>

      <Suspense fallback={<SectionLoading label="Schooling" />}>
        <SchoolingSectionsLoader />
      </Suspense>

      <Suspense fallback={<SectionLoading label="Detailed Personnel" />}>
        <DetailedPersonnelSectionsLoader />
      </Suspense>
    </div>
  )
}
