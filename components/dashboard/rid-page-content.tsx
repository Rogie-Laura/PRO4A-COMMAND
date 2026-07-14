import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { ForeignNationalTable } from "@/components/dashboard/foreign-national-table"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { IntelEligibilityCards } from "@/components/dashboard/intel-eligibility-cards"
import { RidUploadStatus } from "@/components/dashboard/rid-upload-status"
import { SurrenderedCtgfTable } from "@/components/dashboard/surrendered-ctgf-table"
import { getCriminalGangsAnalytics } from "@/lib/criminal-gangs-records"
import { getForeignNationalAnalytics } from "@/lib/foreign-national-records"
import { getIllegalDrugsAnalytics } from "@/lib/illegal-drugs-records"
import { getIntelEligibilityAnalytics } from "@/lib/intel-eligibility-records"
import { getSurrenderedCtgfAnalytics } from "@/lib/surrendered-ctgf-records"

export async function RidPageContent() {
  const [
    intelEligibilityAnalytics,
    illegalDrugsAnalytics,
    criminalGangsAnalytics,
    surrenderedCtgfAnalytics,
    foreignNationalAnalytics,
  ] = await Promise.all([
    getIntelEligibilityAnalytics(),
    getIllegalDrugsAnalytics(),
    getCriminalGangsAnalytics(),
    getSurrenderedCtgfAnalytics(),
    getForeignNationalAnalytics(),
  ])

  return (
    <div className="space-y-6">
      <RidUploadStatus />

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

      <section className="space-y-4">
        <ForeignNationalTable analytics={foreignNationalAnalytics} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Intelligence Eligibility List</h2>
          <p className="text-sm text-muted-foreground">
            Authorized vs actual strength, training, seminar, at related intel personnel metrics
          </p>
        </div>
        <IntelEligibilityCards analytics={intelEligibilityAnalytics} />
      </section>
    </div>
  )
}
