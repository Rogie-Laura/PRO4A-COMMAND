import { CrimeComparativePanel } from "@/components/dashboard/crime-comparative-panel"
import type { CrimeAnalytics } from "@/lib/crime-types"

type RidmdModuleViewProps = {
  data: CrimeAnalytics
}

export function RidmdModuleView({ data }: RidmdModuleViewProps) {
  return (
    <CrimeComparativePanel
      dataReady={data.dataReady}
      monthlyBreakdown={data.indexCrime.monthlyBreakdown}
    />
  )
}
