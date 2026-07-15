import { CommunityMobilizationPanel } from "@/components/dashboard/community-mobilization-panel"
import { DrugClearingPanel } from "@/components/dashboard/drug-clearing-panel"
import { RcaddSectionCards } from "@/components/dashboard/rcadd-section-cards"
import { getCommunityMobilizationAnalytics } from "@/lib/community-mobilization-records"
import { getDrugClearingAnalytics } from "@/lib/drug-clearing-records"
import { getRcaddAnalytics } from "@/lib/rcadd-accomplishment-records"

export async function RcaddPageContent() {
  const [analytics, drugClearingAnalytics, communityMobilizationAnalytics] = await Promise.all([
    getRcaddAnalytics(),
    getDrugClearingAnalytics(),
    getCommunityMobilizationAnalytics(),
  ])

  return (
    <div className="space-y-4">
      <RcaddSectionCards analytics={analytics} />
      <CommunityMobilizationPanel analytics={communityMobilizationAnalytics} />
      <DrugClearingPanel analytics={drugClearingAnalytics} />
    </div>
  )
}
