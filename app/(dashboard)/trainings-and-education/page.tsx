import { Suspense } from "react"

import { TrainingsContent, TrainingsLoading } from "@/components/dashboard/trainings-content"

export default function TrainingsAndEducationPage() {
  return (
    <Suspense fallback={<TrainingsLoading />}>
      <TrainingsContent />
    </Suspense>
  )
}
