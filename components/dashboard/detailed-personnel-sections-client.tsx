"use client"

import { useCallback, useEffect, useState } from "react"

import { fetchDetailedPersonnelDashboard } from "@/app/(dashboard)/actions"
import { DetailedPersonnelSections } from "@/components/dashboard/detailed-personnel-sections"
import { SectionLoading } from "@/components/dashboard/section-loading"
import { Card, CardContent } from "@/components/ui/card"
import { DASHBOARD_REFRESH_EVENT } from "@/lib/dashboard-refresh"
import type { DetailedPersonnelDashboardData } from "@/lib/detailed-personnel-analytics"

type DetailedState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: DetailedPersonnelDashboardData }

export function DetailedPersonnelSectionsClient() {
  const [state, setState] = useState<DetailedState>({ status: "loading" })

  const load = useCallback(async () => {
    setState({ status: "loading" })
    try {
      const data = await fetchDetailedPersonnelDashboard()
      setState({ status: "ready", data })
    } catch {
      setState({ status: "error" })
    }
  }, [])

  useEffect(() => {
    void load()
    window.addEventListener(DASHBOARD_REFRESH_EVENT, load)
    return () => window.removeEventListener(DASHBOARD_REFRESH_EVENT, load)
  }, [load])

  if (state.status === "loading") {
    return <SectionLoading label="Detailed Personnel" />
  }

  if (state.status === "error") {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardContent className="py-5 text-sm text-muted-foreground">
          Hindi ma-load ang Detailed Personnel data ngayon. Pindutin ang Refresh data o subukan muli.
        </CardContent>
      </Card>
    )
  }

  const { nhq, nosus, rsu, rhqPpo, status } = state.data

  return (
    <DetailedPersonnelSections
      nhq={nhq}
      nosus={nosus}
      rsu={rsu}
      rhqPpo={rhqPpo}
      status={status}
    />
  )
}
