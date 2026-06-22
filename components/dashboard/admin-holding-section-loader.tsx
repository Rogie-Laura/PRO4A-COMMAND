import { AdminHoldingSection } from "@/components/dashboard/admin-holding-section"
import { getAdminHoldingAnalytics, toAdminHoldingSummary } from "@/lib/admin-holding-analytics"

export async function AdminHoldingSectionLoader() {
  const data = await getAdminHoldingAnalytics()

  return <AdminHoldingSection data={toAdminHoldingSummary(data)} />
}
