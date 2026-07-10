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

  return (
    <div className="space-y-6">
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
