"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, RefreshCw, Siren } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  EMPTY_PATROL_COUNTS,
  getPatrollersMonitorUrl,
  PATROL_INTERVENTION_TYPES,
  type PatrolUnitCounts,
} from "@/lib/patrol-intervention-config"
import type { PatrolCountsPayload } from "@/lib/patrollers-counts"

function formatUpdatedAt(value: string | null) {
  if (!value) return "Not loaded yet"
  try {
    return new Date(value).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return value
  }
}

type PoliceInterventionContentProps = {
  patrollersUrl: string
}

export function PoliceInterventionContent({
  patrollersUrl,
}: PoliceInterventionContentProps) {
  const [counts, setCounts] = useState<PatrolUnitCounts>(EMPTY_PATROL_COUNTS)
  const [total, setTotal] = useState(0)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)

  const loadCounts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/patrol-counts", { cache: "no-store" })
      const data = (await response.json()) as PatrolCountsPayload

      if (!data.ok) {
        setError(data.error ?? "Could not load patrol counts.")
        return
      }

      setCounts(data.counts)
      setTotal(data.total)
      setUpdatedAt(data.updated_at)
      setLoadedOnce(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load patrol counts.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Siren className="size-5" />
              <CardDescription className="text-primary/90">
                Live from Patrollers
              </CardDescription>
            </div>
            <CardTitle className="text-2xl">Active field patrol units</CardTitle>
            <CardDescription>
              Counts of units currently on the map with tracking active. Click
              refresh when you need an updated snapshot — not auto-updating.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadCounts}
              disabled={loading}
            >
              <RefreshCw
                className={loading ? "animate-spin" : undefined}
                data-icon="inline-start"
              />
              {loading ? "Refreshing…" : loadedOnce ? "Refresh counts" : "Load counts"}
            </Button>
            <Button type="button" variant="secondary" render={<Link href={patrollersUrl} target="_blank" rel="noopener noreferrer" />}>
              <ExternalLink data-icon="inline-start" />
              Open Patrollers map
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total patrolling</p>
            <p className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {loadedOnce ? total : "—"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {formatUpdatedAt(updatedAt)}
          </p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loadedOnce && !loading && !error && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Press <span className="font-medium text-foreground">Load counts</span>{" "}
            to pull the latest patrol breakdown from Patrollers.
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
                    {loadedOnce ? (counts[type.id] ?? 0) : "—"}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Units on map tagged as {type.label.toLowerCase()}.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
