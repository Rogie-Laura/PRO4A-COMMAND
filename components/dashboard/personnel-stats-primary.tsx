import { AgeDistributionTable } from "@/components/dashboard/age-distribution-table"
import { RankTenureTable } from "@/components/dashboard/rank-tenure-table"
import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { PersonnelStatsRefreshButton } from "@/components/dashboard/personnel-stats-refresh-button"
import { RankDistributionSection } from "@/components/dashboard/rank-distribution-section"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { Card, CardContent } from "@/components/ui/card"
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
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 sm:max-w-xl">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Walang personnel data pa. Mag-upload ng Alphalist workbook sa{" "}
            <span className="font-medium text-foreground">RPRMD → Upload File</span>.
          </CardContent>
        </Card>
    )
  }

  const totalKpi = data.kpis.find((k) => k.id === "total")

  return (
    <>
      <div className="flex justify-end">
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
    </>
  )
}
