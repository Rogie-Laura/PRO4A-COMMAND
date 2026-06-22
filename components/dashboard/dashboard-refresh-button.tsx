"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DASHBOARD_REFRESH_EVENT } from "@/lib/dashboard-refresh"

type DashboardRefreshButtonProps = {
  refreshAction: () => Promise<void>
  label?: string
  pendingLabel?: string
}

export function DashboardRefreshButton({
  refreshAction,
  label = "Refresh data",
  pendingLabel = "Refreshing…",
}: DashboardRefreshButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await refreshAction()
          window.dispatchEvent(new Event(DASHBOARD_REFRESH_EVENT))
          router.refresh()
        })
      }}
    >
      <RefreshCw
        className={pending ? "animate-spin" : undefined}
        data-icon="inline-start"
      />
      {pending ? pendingLabel : label}
    </Button>
  )
}
