import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export async function PersonnelActivityContent() {
  const data = await getPersonnelAnalytics()

  return (
    <BreakdownCard
      title="Personnel Status"
      description="Live count from Google Sheets roster"
      items={data.statusStats}
    />
  )
}
