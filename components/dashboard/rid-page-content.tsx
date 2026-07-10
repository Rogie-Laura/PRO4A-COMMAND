import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { getIllegalDrugsAnalytics } from "@/lib/illegal-drugs-records"

export async function RidPageContent() {
  const analytics = await getIllegalDrugsAnalytics()

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={analytics.lastUpdated}
        sourceLabel={analytics.dataReady ? "Illegal drugs upload" : "Illegal drugs upload"}
        syncDescription={
          analytics.dataReady
            ? `synced from ${analytics.fileName}`
            : "Mag-upload ng ILLEGAL DRUGS.xlsx sa Upload File"
        }
      />

      <IllegalDrugsCards analytics={analytics} />
    </div>
  )
}
