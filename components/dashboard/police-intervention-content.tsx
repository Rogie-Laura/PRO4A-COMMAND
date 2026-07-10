import Link from "next/link"
import { ExternalLink, Siren } from "lucide-react"

import { PoliceInterventionRefreshButton } from "@/components/dashboard/police-intervention-refresh-button"
import { PatrolUnitCards } from "@/components/dashboard/patrol-unit-cards"
import { EstablishmentTypeCards } from "@/components/dashboard/establishment-type-cards"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPatrollersMonitorUrl } from "@/lib/patrol-intervention-config"
import { getPatrolInterventionAnalytics } from "@/lib/patrol-intervention-analytics"
import { getEstablishmentAnalytics } from "@/lib/establishment-records"

export async function PoliceInterventionContent() {
  const [data, establishments] = await Promise.all([
    getPatrolInterventionAnalytics(),
    getEstablishmentAnalytics(),
  ])
  const patrollersUrl = getPatrollersMonitorUrl()

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Siren className="size-5" />
              <CardDescription className="text-primary/90">
                Field patrol snapshot
              </CardDescription>
            </div>
            <CardTitle className="text-2xl">Active field patrol units</CardTitle>
            <CardDescription>
              Counts load once and stay cached while you browse COMMAND. Press
              refresh only when you need a new snapshot from Patrollers — not
              real-time.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PoliceInterventionRefreshButton />
            <Button
              type="button"
              variant="secondary"
              render={
                <Link
                  href={patrollersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink data-icon="inline-start" />
              Open Patrollers map
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Total patrolling</p>
          <p className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
            {data.ok ? data.total : "—"}
          </p>
          {data.ok && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">
                {data.duty_total}
              </span>{" "}
              personnel on duty
            </p>
          )}
        </CardContent>
      </Card>

      {!data.ok && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {data.error ?? "Could not load patrol counts."}
          </CardContent>
        </Card>
      )}

      <PatrolUnitCards
        dataOk={data.ok}
        counts={data.counts}
        dutyCounts={data.duty_counts}
        officeBreakdown={data.office_breakdown}
      />

      <EstablishmentTypeCards analytics={establishments} />
    </div>
  )
}
