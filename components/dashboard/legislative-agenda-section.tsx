import { Scale } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LegislativeAgendaAnalytics } from "@/lib/legislative-agenda-types"
import { cn } from "@/lib/utils"

type LegislativeAgendaSectionProps = {
  analytics: LegislativeAgendaAnalytics
}

function formatStatus(status: string) {
  return status.trim() || "—"
}

function statusBadgeClass(status: string) {
  if (!status.trim()) {
    return "border-dashed text-muted-foreground"
  }

  const normalized = status.toLowerCase()
  if (normalized.includes("approved") || normalized.includes("enacted")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (normalized.includes("pending") || normalized.includes("filed")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }

  return "border-primary/20 bg-primary/5"
}

export function LegislativeAgendaSection({ analytics }: LegislativeAgendaSectionProps) {
  if (!analytics.dataReady || analytics.items.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Legislative Agenda</CardTitle>
          <CardDescription>
            Walang legislative agenda data pa. Mag-upload ng R9 Matrix for Dashboard workbook sa
            Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="size-5 text-indigo-600 dark:text-indigo-400" />
              Legislative Agenda
            </CardTitle>
            <CardDescription>PNP Priority Legislative Measures for the 20th Congress</CardDescription>
          </div>
          <Badge variant="outline">{analytics.items.length} measures</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-lg border bg-background/70">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="w-16 px-4 py-3 font-medium">No.</th>
                <th className="px-4 py-3 font-medium">PNP Priority Legislative Measures</th>
                <th className="w-40 px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.items.map((item) => (
                <tr key={item.number} className="border-b align-top last:border-0">
                  <td className="px-4 py-3 tabular-nums font-medium text-muted-foreground">
                    {item.number}
                  </td>
                  <td className="px-4 py-3 leading-relaxed">{item.measure}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("font-normal", statusBadgeClass(item.status))}>
                      {formatStatus(item.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {analytics.reference ? (
          <p className="rounded-lg border border-muted-foreground/15 bg-muted/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {analytics.reference}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
