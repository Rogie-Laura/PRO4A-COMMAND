import { ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TerrorismThreatAnalytics } from "@/lib/terrorism-threat-types"
import { cn } from "@/lib/utils"

type TerrorismThreatLevelCardProps = {
  analytics: TerrorismThreatAnalytics
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

export function TerrorismThreatLevelCard({ analytics }: TerrorismThreatLevelCardProps) {
  if (!analytics.dataReady || analytics.rows.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Terrorism Threat Level</CardTitle>
          <CardDescription>
            Walang terrorism threat data pa. Mag-upload ng R2 for PRO4A COMMAND.xlsx sa Upload
            File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-red-500/20 bg-gradient-to-br from-red-500/10 via-card to-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />
              Terrorism Threat Level
            </CardTitle>
            <CardDescription>{analytics.periodLabel}</CardDescription>
          </div>
          <Badge variant="outline">{analytics.rows.length} provinces</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-lg border bg-background/70">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Province</th>
                <th className="px-4 py-3 font-medium">Threat Level</th>
                <th className="px-4 py-3 font-medium">Security Measure</th>
                <th className="px-4 py-3 font-medium">Parameter</th>
              </tr>
            </thead>
            <tbody>
              {analytics.rows.map((row) => (
                <tr key={row.province} className="border-b align-top last:border-0">
                  <td className="px-4 py-3 font-medium">{row.province}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("font-semibold", threatBadgeClass(row.threatLevel))}>
                      {row.threatLevel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.securityMeasure}</td>
                  <td className="px-4 py-3 leading-relaxed text-muted-foreground">{row.parameter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {analytics.note ? (
          <p className="rounded-lg border border-muted-foreground/15 bg-muted/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {analytics.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
