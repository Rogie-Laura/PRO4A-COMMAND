import { RlrddModulesCarousel } from "@/components/dashboard/rlrdd-modules-carousel"
import { getFirearmsAnalytics } from "@/lib/firearms-records"
import { getMobilityAnalytics } from "@/lib/mobility-analytics"

export async function RlrddPageContent() {
  const [firearms, mobility] = await Promise.all([
    getFirearmsAnalytics(),
    getMobilityAnalytics(),
  ])

  return (
    <div className="space-y-4">
      <RlrddModulesCarousel firearms={firearms} mobility={mobility} />
    </div>
  )
}
