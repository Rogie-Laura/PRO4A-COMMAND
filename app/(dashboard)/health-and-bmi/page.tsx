import { Suspense } from "react"

import {
  HealthAndBmiContent,
  HealthAndBmiLoading,
} from "@/components/dashboard/health-and-bmi-content"

export default function HealthAndBmiPage() {
  return (
    <Suspense fallback={<HealthAndBmiLoading />}>
      <HealthAndBmiContent />
    </Suspense>
  )
}
