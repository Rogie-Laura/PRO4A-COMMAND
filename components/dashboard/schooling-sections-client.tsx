"use client"

import { useCallback, useEffect, useState } from "react"

import { fetchSchoolingDashboardSummaries } from "@/app/(dashboard)/actions"
import { SchoolingSections } from "@/components/dashboard/schooling-sections"
import { SectionLoading } from "@/components/dashboard/section-loading"
import { Card, CardContent } from "@/components/ui/card"
import { DASHBOARD_REFRESH_EVENT } from "@/lib/dashboard-refresh"
import type { SchoolingSummary } from "@/lib/schooling-types"

type SchoolingState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; mandatory: SchoolingSummary; specialized: SchoolingSummary }

export function SchoolingSectionsClient() {
  const [state, setState] = useState<SchoolingState>({ status: "loading" })

  const load = useCallback(async () => {
    setState({ status: "loading" })
    try {
      const data = await fetchSchoolingDashboardSummaries()
      setState({ status: "ready", ...data })
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
    return <SectionLoading label="Schooling" />
  }

  if (state.status === "error") {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardContent className="py-5 text-sm text-muted-foreground">
          Hindi ma-load ang Schooling data ngayon. Subukan muli mamaya o mag-upload ng bagong workbook.
        </CardContent>
      </Card>
    )
  }

  return <SchoolingSections mandatory={state.mandatory} specialized={state.specialized} />
}
