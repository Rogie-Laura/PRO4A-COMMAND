import { ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TERRORISM_THREAT_REGION_LABEL,
  type TerrorismThreatAnalytics,
  type TerrorismThreatRow,
} from "@/lib/terrorism-threat-types"
import { cn } from "@/lib/utils"

type TerrorismThreatLevelCardProps = {
  analytics: TerrorismThreatAnalytics
  compact?: boolean
}

function threatBadgeClass(level: string) {
  const normalized = level.trim().toLowerCase()

  if (normalized === "low") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (normalized === "moderate" || normalized === "medium") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
  if (normalized === "high" || normalized === "critical" || normalized === "severe") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
  }

  return "border-primary/20 bg-primary/5"
}

function normalizeLegacyRow(row: TerrorismThreatRow & { province?: string }): TerrorismThreatRow {
  return {
    region: row.region || row.province || TERRORISM_THREAT_REGION_LABEL,
    threatLevel: row.threatLevel,
    securityMeasure: row.securityMeasure,
    parameter: row.parameter,
  }
}

export function TerrorismThreatLevelCard({
  analytics,
  compact = false,
}: TerrorismThreatLevelCardProps) {
  const regionThreat = analytics.rows[0]
    ? normalizeLegacyRow(analytics.rows[0] as TerrorismThreatRow & { province?: string })
    : null

  if (!analytics.dataReady || !regionThreat) {
    return (
      <Card
        className={cn(
          "border-dashed border-muted-foreground/25 bg-muted/10",
          compact && "h-full w-full",
        )}
      >
        <CardHeader>
          <CardTitle>Terrorism Threat Level</CardTitle>
          <CardDescription>
            Walang terrorism threat data pa. Mag-upload ng TERRORISM THREAT LEVEL.xlsx sa Upload
            File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "h-full border-red-500/20 bg-gradient-to-br from-red-500/10 via-card to-card",
        compact && "w-full",
      )}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />
              Terrorism Threat Level
            </CardTitle>
            <CardDescription>{analytics.periodLabel}</CardDescription>
          </div>
          <Badge variant="outline" className="font-semibold">
            {regionThreat.region}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {compact ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Threat Level
              </p>
              <Badge
                variant="outline"
                className={cn("mt-2 text-base font-semibold", threatBadgeClass(regionThreat.threatLevel))}
              >
                {regionThreat.threatLevel}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Security Measure
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug">{regionThreat.securityMeasure}</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{regionThreat.parameter}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-red-500/15 bg-background/70 p-4 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Threat Level
              </p>
              <Badge
                variant="outline"
                className={cn("mt-3 text-base font-semibold", threatBadgeClass(regionThreat.threatLevel))}
              >
                {regionThreat.threatLevel}
              </Badge>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-4 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Security Measure
              </p>
              <p className="mt-3 text-base font-semibold leading-snug">{regionThreat.securityMeasure}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-4 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Parameter
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {regionThreat.parameter}
              </p>
            </div>
          </div>
        )}

        {analytics.note ? (
          <p className="rounded-lg border border-muted-foreground/15 bg-muted/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {analytics.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
