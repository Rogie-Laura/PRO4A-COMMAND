import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { AdminHoldingSection } from "@/components/dashboard/admin-holding-section"
import { AgeDistributionTable } from "@/components/dashboard/age-distribution-table"
import { RankTenureTable } from "@/components/dashboard/rank-tenure-table"
import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { PersonnelStatsRefreshButton } from "@/components/dashboard/personnel-stats-refresh-button"
import { RankDistributionSection } from "@/components/dashboard/rank-distribution-section"
import { DetailedPersonnelSections } from "@/components/dashboard/detailed-personnel-sections"
import { SchoolingSections } from "@/components/dashboard/schooling-sections"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { getAdminHoldingAnalytics } from "@/lib/admin-holding-analytics"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"
import {
  getDetailedNhqAnalytics,
  getDetailedNosusAnalytics,
  getDetailedRhqPpoAnalytics,
  getDetailedRsuAnalytics,
} from "@/lib/detailed-personnel-analytics"
import {
  getSchoolingMandatoryAnalytics,
  getSchoolingSpecializedAnalytics,
} from "@/lib/schooling-analytics"

export async function PersonnelStatsContent() {
  const [
    data,
    adminHolding,
    schoolingMandatory,
    schoolingSpecialized,
    detailedNhq,
    detailedNosus,
    detailedRsu,
    detailedRhqPpo,
  ] = await Promise.all([
    getPersonnelAnalytics(),
    getAdminHoldingAnalytics(),
    getSchoolingMandatoryAnalytics(),
    getSchoolingSpecializedAnalytics(),
    getDetailedNhqAnalytics(),
    getDetailedNosusAnalytics(),
    getDetailedRsuAnalytics(),
    getDetailedRhqPpoAnalytics(),
  ])
  const totalKpi = data.kpis.find((k) => k.id === "total")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DataSyncBanner
          lastUpdated={data.lastUpdated}
          sourceLabel="Personnel tab"
          syncDescription="synced from Google Sheet (cached until you refresh)"
        />
        <PersonnelStatsRefreshButton />
      </div>

      {totalKpi && (
        <TotalPersonnelSection
          total={totalKpi}
          offices={data.officeBreakdown}
          workforce={data.workforce}
        />
      )}

      <RankDistributionSection distribution={data.rankDistribution} />

      <LeadershipSection leadership={data.leadership} />

      <AgeDistributionTable rows={data.ageDistributionByOffice} />

      <RankTenureTable rows={data.rankTenureDistribution} />

      <UnitTable rows={data.unitRows} />

      <AdminHoldingSection data={adminHolding} />

      <SchoolingSections mandatory={schoolingMandatory} specialized={schoolingSpecialized} />

      <DetailedPersonnelSections
        nhq={detailedNhq}
        nosus={detailedNosus}
        rsu={detailedRsu}
        rhqPpo={detailedRhqPpo}
      />
    </div>
  )
}
