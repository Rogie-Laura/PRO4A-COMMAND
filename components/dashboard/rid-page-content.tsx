import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { getCriminalGangsAnalytics } from "@/lib/criminal-gangs-records"
import { getIllegalDrugsAnalytics } from "@/lib/illegal-drugs-records"

export async function RidPageContent() {
  const [illegalDrugsAnalytics, criminalGangsAnalytics] = await Promise.all([
    getIllegalDrugsAnalytics(),
    getCriminalGangsAnalytics(),
  ])

  const lastUpdated = [illegalDrugsAnalytics.lastUpdated, criminalGangsAnalytics.lastUpdated]
    .filter(Boolean)
    .sort()
    .at(-1)

  const syncParts = [
    illegalDrugsAnalytics.dataReady ? `Illegal drugs from ${illegalDrugsAnalytics.fileName}` : null,
    criminalGangsAnalytics.dataReady
      ? `Criminal gangs from ${criminalGangsAnalytics.fileName}`
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
            : "Mag-upload ng ILLEGAL DRUGS.xlsx at ACCOMPLISHMENTS ON CRIMINAL GANGS.xlsx sa Upload File"
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
    </div>
  )
}
