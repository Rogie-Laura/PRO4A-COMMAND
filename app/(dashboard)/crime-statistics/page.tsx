import { Suspense } from "react"

import {
  CrimeStatisticsContent,
  CrimeStatisticsLoading,
} from "@/components/dashboard/crime-statistics-content"

export default function CrimeStatisticsPage() {
  return (
    <Suspense fallback={<CrimeStatisticsLoading />}>
      <CrimeStatisticsContent />
    </Suspense>
  )
}
