import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { SurrenderedCtgfTable } from "@/components/dashboard/surrendered-ctgf-table"
import { getCriminalGangsAnalytics } from "@/lib/criminal-gangs-records"
import { getIllegalDrugsAnalytics } from "@/lib/illegal-drugs-records"
import { getSurrenderedCtgfAnalytics } from "@/lib/surrendered-ctgf-records"

export async function RidPageContent() {
  const [illegalDrugsAnalytics, criminalGangsAnalytics, surrenderedCtgfAnalytics] =
    await Promise.all([
      getIllegalDrugsAnalytics(),
      getCriminalGangsAnalytics(),
      getSurrenderedCtgfAnalytics(),
    ])

  const lastUpdated = [
    illegalDrugsAnalytics.lastUpdated,
    criminalGangsAnalytics.lastUpdated,
    surrenderedCtgfAnalytics.lastUpdated,
  ]
    .filter(Boolean)
    .sort()
    .at(-1)

  const syncParts = [
    illegalDrugsAnalytics.dataReady ? `Illegal drugs from ${illegalDrugsAnalytics.fileName}` : null,
    criminalGangsAnalytics.dataReady
      ? `Criminal gangs from ${criminalGangsAnalytics.fileName}`
      : null,
    surrenderedCtgfAnalytics.dataReady
      ? `Surrendered CTGs from ${surrenderedCtgfAnalytics.fileName}`
      : null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <DataSyncBanner
        lastUpdated={lastUpdated ?? new Date().toISOString()}
        sourceLabel="RID"
        syncDescription={
          syncParts.length > 0
            ? syncParts.join(" · ")
            : "Mag-upload ng RID workbooks sa Upload File"
        }
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Illegal Drugs</h2>
          <p className="text-sm text-muted-foreground">HVI at SLI accomplishments</p>
        </div>
        <IllegalDrugsCards analytics={illegalDrugsAnalytics} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Criminal Gangs</h2>
          <p className="text-sm text-muted-foreground">
            Drug Groups, Gun-for-Hire, at Other Criminal Groups
          </p>
        </div>
        <CriminalGangsCards analytics={criminalGangsAnalytics} />
      </section>

      <section className="space-y-4">
        <SurrenderedCtgfTable analytics={surrenderedCtgfAnalytics} />
      </section>
    </div>
  )
}
