import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { AdminHoldingSection } from "@/components/dashboard/admin-holding-section"
import { AgeDistributionTable } from "@/components/dashboard/age-distribution-table"
import { RankTenureTable } from "@/components/dashboard/rank-tenure-table"
import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { PersonnelStatsRefreshButton } from "@/components/dashboard/personnel-stats-refresh-button"
import { RankDistributionSection } from "@/components/dashboard/rank-distribution-section"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { getAdminHoldingAnalytics } from "@/lib/admin-holding-analytics"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export async function PersonnelStatsContent() {
  const [data, adminHolding] = await Promise.all([
    getPersonnelAnalytics(),
    getAdminHoldingAnalytics(),
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
    </div>
  )
}
