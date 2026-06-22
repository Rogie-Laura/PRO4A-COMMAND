import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { AgeDistributionTable } from "@/components/dashboard/age-distribution-table"
import { RankTenureTable } from "@/components/dashboard/rank-tenure-table"
import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { PersonnelStatsRefreshButton } from "@/components/dashboard/personnel-stats-refresh-button"
import { RankDistributionSection } from "@/components/dashboard/rank-distribution-section"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { UnitTable } from "@/components/dashboard/unit-table"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"
import {
  toOfficeBreakdownCards,
  toRankTenureTableRows,
} from "@/lib/personnel-client-payload"

export async function PersonnelStatsPrimary() {
  let data
  try {
    data = await getPersonnelAnalytics()
  } catch {
    return (
      <p className="text-sm text-muted-foreground">
        Personnel data unavailable. Try refreshing.
      </p>
    )
  }

  const totalKpi = data.kpis.find((k) => k.id === "total")

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DataSyncBanner
          lastUpdated={data.lastUpdated}
          sourceLabel="Personnel tab"
          syncDescription="synced from Google Sheet (cached until you refresh)"
        />
        <PersonnelStatsRefreshButton />
      </div>

      {totalKpi ? (
        <TotalPersonnelSection
          total={totalKpi}
          offices={toOfficeBreakdownCards(data.officeBreakdown)}
          workforce={data.workforce}
        />
      ) : null}

      <RankDistributionSection distribution={data.rankDistribution} />

      <LeadershipSection leadership={data.leadership} />

      <AgeDistributionTable rows={data.ageDistributionByOffice} />

      <RankTenureTable rows={toRankTenureTableRows(data.rankTenureDistribution)} />

      <UnitTable rows={data.unitRows} />
    </>
  )
}
