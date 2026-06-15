import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { AgeDistributionTable } from "@/components/dashboard/age-distribution-table"
import { RankTenureTable } from "@/components/dashboard/rank-tenure-table"
import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { PersonnelStatsRefreshButton } from "@/components/dashboard/personnel-stats-refresh-button"
import { RankDistributionSection } from "@/components/dashboard/rank-distribution-section"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export async function PersonnelStatsContent() {
  const data = await getPersonnelAnalytics()
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

      <BreakdownCard
        title="Personnel Status"
        description="Current duty and assignment status"
        items={data.statusStats}
      />
    </div>
  )
}
