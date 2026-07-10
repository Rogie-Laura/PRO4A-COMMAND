import { RcaddSectionCards } from "@/components/dashboard/rcadd-section-cards"
import { getRcaddAnalytics } from "@/lib/rcadd-accomplishment-records"

export async function RcaddPageContent() {
  const analytics = await getRcaddAnalytics()

  return (
    <div className="space-y-4">
      <RcaddSectionCards analytics={analytics} />
    </div>
  )
}
