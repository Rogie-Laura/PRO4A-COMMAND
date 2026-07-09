import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { RcaddSectionCards } from "@/components/dashboard/rcadd-section-cards"
import { getRcaddAnalytics } from "@/lib/rcadd-accomplishment-records"

export async function RcaddPageContent() {
  const analytics = await getRcaddAnalytics()

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={analytics.lastUpdated}
        sourceLabel={analytics.dataReady ? "RCADD workbook upload" : "RCADD upload"}
        syncDescription={
          analytics.dataReady
            ? `synced from ${analytics.fileName}`
            : "Mag-upload ng RCADD ACCOMPLISHMENT workbook sa Upload File"
        }
      />

      <RcaddSectionCards analytics={analytics} />
    </div>
  )
}
