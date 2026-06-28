import { Suspense } from "react"

import { RidmdContent, RidmdLoading } from "@/components/dashboard/ridmd-content"

export default function RidmdPage() {
  return (
    <Suspense fallback={<RidmdLoading />}>
      <RidmdContent />
    </Suspense>
  )
}
