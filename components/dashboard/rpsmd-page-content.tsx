import { LegislativeAgendaSection } from "@/components/dashboard/legislative-agenda-section"
import { PpoUperRankingsCard } from "@/components/dashboard/ppo-uper-rankings-card"
import { StationClassificationSection } from "@/components/dashboard/station-classification-section"
import { Card, CardContent } from "@/components/ui/card"
import { getLegislativeAgendaAnalytics } from "@/lib/legislative-agenda-records"
import { getPpoUperAnalytics } from "@/lib/ppo-uper-records"
import { getStationClassificationAnalytics } from "@/lib/station-classification-records"
import { getUperAnalytics } from "@/lib/uper-records"

export async function RpsmdPageContent() {
  const [analytics, ppoAnalytics, stationClassification, legislativeAgenda] = await Promise.all([
    getUperAnalytics(),
    getPpoUperAnalytics(),
    getStationClassificationAnalytics(),
    getLegislativeAgendaAnalytics(),
  ])

  const hasProData = analytics.dataReady
  const hasPpoData = ppoAnalytics.dataReady

  return (
    <div className="space-y-4">
      <PpoUperRankingsCard analytics={ppoAnalytics} />
      <StationClassificationSection analytics={stationClassification} />
      <LegislativeAgendaSection analytics={legislativeAgenda} />

      {hasProData && analytics.trend.length > 1 ? (
        <Card className="max-w-md border-muted-foreground/20 bg-muted/10">
          <CardContent className="py-4 text-sm text-muted-foreground">
            PRO 4A current rank at trend ay nasa{" "}
            <a href="/pro4a-status" className="font-medium text-primary underline-offset-4 hover:underline">
              PRO4A Status
            </a>
            . Covered months: {analytics.trend.map((point) => point.shortLabel).join(" · ")}.
          </CardContent>
        </Card>
      ) : null}

      {hasPpoData && ppoAnalytics.months.length > 1 ? (
        <Card className="max-w-md border-muted-foreground/20 bg-muted/10">
          <CardContent className="py-4 text-sm text-muted-foreground">
            PPO covered months:{" "}
            {ppoAnalytics.months.map((month) => month.monthLabel).join(" · ")}. Magdagdag ng bagong
            sheet sa UPER of PPOs workbook at i-upload ulit.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
