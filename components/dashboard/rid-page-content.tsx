import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { ForeignNationalTable } from "@/components/dashboard/foreign-national-table"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { IntelEligibilityCards } from "@/components/dashboard/intel-eligibility-cards"
import { RidSectionHeader } from "@/components/dashboard/rid-section-header"
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
      <section className="space-y-4">
        <RidSectionHeader
          title="Illegal Drugs"
          description="HVI at SLI accomplishments"
          uploadedAt={illegalDrugsAnalytics.lastUpdated}
          dataReady={illegalDrugsAnalytics.dataReady}
        />
        <IllegalDrugsCards analytics={illegalDrugsAnalytics} />
      </section>

      <section className="space-y-4">
        <RidSectionHeader
          title="Criminal Gangs"
          description="Drug Groups, Gun-for-Hire, at Other Criminal Groups"
          uploadedAt={criminalGangsAnalytics.lastUpdated}
          dataReady={criminalGangsAnalytics.dataReady}
        />
        <CriminalGangsCards analytics={criminalGangsAnalytics} />
      </section>

      <section className="space-y-4">
        <SurrenderedCtgfTable analytics={surrenderedCtgfAnalytics} />
      </section>

      <section className="space-y-4">
        <ForeignNationalTable analytics={foreignNationalAnalytics} />
      </section>

      <section className="space-y-4">
        <RidSectionHeader
          title="Intelligence Eligibility List"
          description="Authorized vs actual strength, training, seminar, at related intel personnel metrics"
          uploadedAt={intelEligibilityAnalytics.lastUpdated}
          dataReady={intelEligibilityAnalytics.dataReady}
        />
        <IntelEligibilityCards analytics={intelEligibilityAnalytics} />
      </section>
    </div>
  )
}
