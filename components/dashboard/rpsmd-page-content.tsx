import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { LegislativeAgendaSection } from "@/components/dashboard/legislative-agenda-section"
import { PpoUperRankingsCard } from "@/components/dashboard/ppo-uper-rankings-card"
import { StationClassificationSection } from "@/components/dashboard/station-classification-section"
import { UperCurrentRankingCard } from "@/components/dashboard/uper-current-ranking-card"
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

  const lastUpdated =
    [
      analytics.lastUpdated,
      ppoAnalytics.lastUpdated,
      stationClassification.lastUpdated,
      legislativeAgenda.lastUpdated,
    ]
      .filter(Boolean)
      .sort()
      .at(-1) ?? new Date().toISOString()

  const hasProData = analytics.dataReady
  const hasPpoData = ppoAnalytics.dataReady
  const hasStationData = stationClassification.dataReady
  const hasLegislativeData = legislativeAgenda.dataReady

  const syncParts = [
    hasProData ? `PRO 4A from ${analytics.fileName}` : null,
    hasPpoData ? `PPO from ${ppoAnalytics.fileName}` : null,
    hasStationData ? `Stations from ${stationClassification.fileName}` : null,
    hasLegislativeData ? `Legislative from ${legislativeAgenda.fileName}` : null,
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={lastUpdated}
        sourceLabel={syncParts.length > 0 ? "RPSMD uploads" : "RPSMD upload"}
        syncDescription={
          syncParts.length > 0 ? syncParts.join(" · ") : "Mag-upload ng RPSMD workbooks sa Upload File"
        }
      />

      <UperCurrentRankingCard analytics={analytics} />
      <PpoUperRankingsCard analytics={ppoAnalytics} />
      <StationClassificationSection analytics={stationClassification} />
      <LegislativeAgendaSection analytics={legislativeAgenda} />

      {hasProData && analytics.trend.length > 1 ? (
        <Card className="max-w-md border-muted-foreground/20 bg-muted/10">
          <CardContent className="py-4 text-sm text-muted-foreground">
            PRO 4A covered months: {analytics.trend.map((point) => point.shortLabel).join(" · ")}.
            Magdagdag ng bagong sheet sa workbook at i-upload ulit para ma-update ang trend.
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
