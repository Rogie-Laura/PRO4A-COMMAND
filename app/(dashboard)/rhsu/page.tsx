import { Suspense } from "react"

import { RhsuContent } from "@/components/dashboard/rhsu-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function RhsuPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-14 w-72" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <RhsuContent />
    </Suspense>
  )
}
