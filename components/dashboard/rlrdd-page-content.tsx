import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { RlrddModulesCarousel } from "@/components/dashboard/rlrdd-modules-carousel"
import { FirearmsUploadCard } from "@/components/settings/firearms-upload-card"
import { getSession } from "@/lib/auth/get-session"
import { isSuperAdmin } from "@/lib/auth/roles"
import { getFirearmsAnalytics, getLatestFirearmsUploadBatch } from "@/lib/firearms-records"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export async function RlrddPageContent() {
  const session = await getSession()
  const canUpload = session ? isSuperAdmin(session.role) : false

  const [firearms, mobility, latestFirearmsBatch] = await Promise.all([
    getFirearmsAnalytics(),
    getMobilityAnalytics(),
    canUpload ? getLatestFirearmsUploadBatch().catch(() => null) : Promise.resolve(null),
  ])

  const lastUpdated =
    firearms.dataReady && firearms.lastUpdated > mobility.lastUpdated
      ? firearms.lastUpdated
      : mobility.lastUpdated

  return (
    <div className="space-y-4">
      <DataSyncBanner
        lastUpdated={lastUpdated}
        sourceLabel={firearms.dataReady ? "firearms.xlsx upload" : "Mobility tab"}
        syncDescription={
          firearms.dataReady
            ? "synced from uploaded firearms workbook"
            : "synced from Google Sheet (cached until you refresh)"
        }
      />

      {canUpload && !firearms.dataReady ? (
        <FirearmsUploadCard latestBatch={latestFirearmsBatch} compact />
      ) : null}

      <RlrddModulesCarousel firearms={firearms} mobility={mobility} />

      {canUpload && firearms.dataReady ? (
        <FirearmsUploadCard latestBatch={latestFirearmsBatch} compact />
      ) : null}
    </div>
  )
}
