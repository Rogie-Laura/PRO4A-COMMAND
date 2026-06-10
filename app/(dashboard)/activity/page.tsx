import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import { getPersonnelAnalytics } from "@/lib/personnel-analytics"

export default async function ActivityPage() {
  const data = await getPersonnelAnalytics()

  return (
    <BreakdownCard
      title="Personnel Status"
      description="Live count from Google Sheets roster"
      items={data.statusStats}
    />
  )
}
