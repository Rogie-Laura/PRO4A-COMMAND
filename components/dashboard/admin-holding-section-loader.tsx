import { AdminHoldingSection } from "@/components/dashboard/admin-holding-section"
import { getAdminHoldingAnalytics, toAdminHoldingSummary } from "@/lib/admin-holding-analytics"

export async function AdminHoldingSectionLoader() {
  let data
  try {
    data = await getAdminHoldingAnalytics()
  } catch {
    return null
  }

  return <AdminHoldingSection data={toAdminHoldingSummary(data)} />
}
