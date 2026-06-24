import { Suspense } from "react"

import { AdminHoldingSectionLoader } from "@/components/dashboard/admin-holding-section-loader"
import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { DetailedPersonnelSectionsLoader } from "@/components/dashboard/detailed-personnel-sections-loader"
import { PersonnelStatsPrimary } from "@/components/dashboard/personnel-stats-primary"
import { SchoolingSectionsLoader } from "@/components/dashboard/schooling-sections-loader"
import { SectionErrorBoundary } from "@/components/dashboard/section-error-boundary"
import { SectionLoading } from "@/components/dashboard/section-loading"

export function PersonnelStatsContent() {
  return (
    <div className="space-y-6">
      <SectionErrorBoundary label="RPRMD">
        <Suspense fallback={<DashboardLoading />}>
          <PersonnelStatsPrimary />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary label="Admin Holding">
        <Suspense fallback={<SectionLoading label="Admin Holding" />}>
          <AdminHoldingSectionLoader />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary label="Schooling">
        <SchoolingSectionsLoader />
      </SectionErrorBoundary>

      <SectionErrorBoundary label="Detailed Personnel">
        <DetailedPersonnelSectionsLoader />
      </SectionErrorBoundary>
    </div>
  )
}
