"use client"

import { useTransition } from "react"
import { RefreshCwIcon } from "lucide-react"

import { refreshCrimeStatisticsData } from "@/app/(dashboard)/crime-statistics/actions"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function CrimeStatisticsRefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(async () => {
      await refreshCrimeStatisticsData()
      router.refresh()
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
      <RefreshCwIcon className={isPending ? "animate-spin" : undefined} />
      {isPending ? "Refreshing..." : "Refresh data"}
    </Button>
  )
}
