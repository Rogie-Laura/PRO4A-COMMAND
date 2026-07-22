import { Suspense } from "react"

import { RcdContent } from "@/components/dashboard/rcd-content"
import { Skeleton } from "@/components/ui/skeleton"
import { getRcdAnalytics } from "@/lib/rcd-records"

function RcdLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

async function RcdPageContent() {
  const data = await getRcdAnalytics()
  return <RcdContent data={data} />
}

export default function RcdPage() {
  return (
    <Suspense fallback={<RcdLoading />}>
      <RcdPageContent />
    </Suspense>
  )
}
