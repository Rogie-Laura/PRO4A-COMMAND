import { DrugClearingPanel } from "@/components/dashboard/drug-clearing-panel"
import { RcaddSectionCards } from "@/components/dashboard/rcadd-section-cards"
import { getDrugClearingAnalytics } from "@/lib/drug-clearing-records"
import { getRcaddAnalytics } from "@/lib/rcadd-accomplishment-records"

export async function RcaddPageContent() {
  const [analytics, drugClearingAnalytics] = await Promise.all([
    getRcaddAnalytics(),
    getDrugClearingAnalytics(),
  ])

  return (
    <div className="space-y-4">
      <RcaddSectionCards analytics={analytics} />
      <DrugClearingPanel analytics={drugClearingAnalytics} />
    </div>
  )
}
