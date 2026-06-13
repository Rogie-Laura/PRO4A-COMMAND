import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Siren } from "lucide-react"

import { PoliceInterventionRefreshButton } from "@/components/dashboard/police-intervention-refresh-button"
import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getPatrollersMonitorUrl,
  PATROL_INTERVENTION_TYPES,
} from "@/lib/patrol-intervention-config"
import { getPatrolInterventionAnalytics } from "@/lib/patrol-intervention-analytics"

export async function PoliceInterventionContent() {
  const data = await getPatrolInterventionAnalytics()
  const patrollersUrl = getPatrollersMonitorUrl()

  return (
    <div className="space-y-4">
      {data.ok && data.updated_at && (
        <DataSyncBanner
          lastUpdated={data.updated_at}
          sourceLabel="Patrollers"
          syncDescription="synced from Patrollers monitoring (cached until you refresh)"
        />
      )}

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PATROL_INTERVENTION_TYPES.map((type) => (
          <Card key={type.id} className="gap-0 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted/60">
                  <Image
                    src={type.image}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <CardDescription>{type.label}</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {data.ok ? (data.counts[type.id] ?? 0) : "—"}
                  </CardTitle>
                  {data.ok && (
                    <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {data.duty_counts[type.id] ?? 0}
                      </span>{" "}
                      on duty
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Active units on map · personnel marked on duty in the mobile app.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
