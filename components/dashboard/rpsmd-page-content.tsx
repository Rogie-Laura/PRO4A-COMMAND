import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { UperCurrentRankingCard } from "@/components/dashboard/uper-current-ranking-card"
import { Card, CardContent } from "@/components/ui/card"
import { getUperAnalytics } from "@/lib/uper-records"

export async function RpsmdPageContent() {
  const analytics = await getUperAnalytics()

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={analytics.lastUpdated}
        sourceLabel={analytics.dataReady ? "DPL UPER workbook" : "UPER upload"}
        syncDescription={
          analytics.dataReady
            ? `synced from ${analytics.fileName}`
            : "Mag-upload ng PRO 4A UPER from DPL.xlsx sa Upload File"
        }
      />

      <UperCurrentRankingCard analytics={analytics} />

      {analytics.dataReady && analytics.trend.length > 1 ? (
        <Card className="max-w-md border-muted-foreground/20 bg-muted/10">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Covered months: {analytics.trend.map((point) => point.shortLabel).join(" · ")}. Magdagdag
            ng bagong sheet (hal. May 2026) sa workbook at i-upload ulit para ma-update ang trend.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
