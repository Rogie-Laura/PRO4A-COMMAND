import { AgeDistributionTable } from "@/components/dashboard/age-distribution-table"
import { LeadershipSection } from "@/components/dashboard/leadership-section"
import { PersonnelGainsLossesCard } from "@/components/dashboard/personnel-gains-losses-card"
import { PpoLeadershipTenureSection } from "@/components/dashboard/ppo-leadership-tenure-section"
import { RankDistributionSection } from "@/components/dashboard/rank-distribution-section"
import { RankTenureTable } from "@/components/dashboard/rank-tenure-table"
import { TotalPersonnelSection } from "@/components/dashboard/total-personnel-section"
import { Card, CardContent } from "@/components/ui/card"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"
import {
  toOfficeBreakdownCards,
  toRankTenureTableRows,
} from "@/lib/personnel-client-payload"
import { buildPpoLeadershipTenure } from "@/lib/ppo-leadership-tenure"
import { getRprmdWorkbookPayload } from "@/lib/rprmd-workbook-records"

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

  const workbook = await getRprmdWorkbookPayload().catch(() => null)
  const ppoTenureCards = buildPpoLeadershipTenure(workbook?.personnelRecords ?? [])
  const totalKpi = data.kpis.find((k) => k.id === "total")

  return (
    <>
      {totalKpi ? (
        <TotalPersonnelSection
          total={totalKpi}
          offices={toOfficeBreakdownCards(data.officeBreakdown)}
          workforce={data.workforce}
        />
      ) : null}

      <RankDistributionSection distribution={data.rankDistribution} />

      <LeadershipSection leadership={data.leadership} />

      <PersonnelGainsLossesCard data={workbook?.personnelGainsLosses ?? null} />

      <PpoLeadershipTenureSection cards={ppoTenureCards} />

      <AgeDistributionTable rows={data.ageDistributionByOffice} />

      <RankTenureTable rows={toRankTenureTableRows(data.rankTenureDistribution)} />
    </>
  )
}
