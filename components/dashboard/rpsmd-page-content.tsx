import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { PpoUperRankingsCard } from "@/components/dashboard/ppo-uper-rankings-card"
import { UperCurrentRankingCard } from "@/components/dashboard/uper-current-ranking-card"
import { Card, CardContent } from "@/components/ui/card"
import { getPpoUperAnalytics } from "@/lib/ppo-uper-records"
import { getUperAnalytics } from "@/lib/uper-records"

export async function RpsmdPageContent() {
  const [analytics, ppoAnalytics] = await Promise.all([getUperAnalytics(), getPpoUperAnalytics()])

  const lastUpdated =
    [analytics.lastUpdated, ppoAnalytics.lastUpdated].filter(Boolean).sort().at(-1) ??
    new Date().toISOString()

  const hasProData = analytics.dataReady
  const hasPpoData = ppoAnalytics.dataReady

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={lastUpdated}
        sourceLabel={
          hasProData || hasPpoData ? "RPSMD UPER uploads" : "UPER upload"
        }
        syncDescription={
          hasProData || hasPpoData
            ? [
                hasProData ? `PRO 4A from ${analytics.fileName}` : null,
                hasPpoData ? `PPO from ${ppoAnalytics.fileName}` : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : "Mag-upload ng PRO 4A UPER at UPER of PPOs sa Upload File"
        }
      />

      <UperCurrentRankingCard analytics={analytics} />
      <PpoUperRankingsCard analytics={ppoAnalytics} />

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
            sheet (hal. June 2026) sa UPER of PPOs workbook at i-upload ulit.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
