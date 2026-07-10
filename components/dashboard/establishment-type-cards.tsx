"use client"

import { useMemo, useState } from "react"
import { Building2, MapPinned } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  EstablishmentAnalytics,
  EstablishmentTypeSummary,
} from "@/lib/establishment-types"
import { cn } from "@/lib/utils"

type EstablishmentTypeCardsProps = {
  analytics: EstablishmentAnalytics
}

function PpoBreakdownTable({ rows }: { rows: EstablishmentTypeSummary["ppoBreakdown"] }) {
  return (
    <div className="max-h-[min(60vh,28rem)] overflow-y-auto rounded-lg border bg-muted/10">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background/95 backdrop-blur">
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">PPO</th>
            <th className="px-4 py-3 font-medium text-right">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.ppo} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{row.ppo}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.count.toLocaleString("en-PH")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EstablishmentTypeCards({ analytics }: EstablishmentTypeCardsProps) {
  const [selectedType, setSelectedType] = useState<EstablishmentTypeSummary | null>(null)

  const topTypes = useMemo(() => analytics.types.slice(0, 12), [analytics.types])

  if (!analytics.dataReady || analytics.types.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Establishments</CardTitle>
          <CardDescription>
            Walang establishment data pa. Mag-upload ng PRO 4A ESTABLISHMENT.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="size-5 text-amber-600 dark:text-amber-400" />
                Establishments
              </CardTitle>
              <CardDescription>
                {analytics.totalCount.toLocaleString("en-PH")} mapped establishments across CALABARZON
              </CardDescription>
            </div>
            <Badge variant="outline">{analytics.types.length} types</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            I-click ang type card para makita ang breakdown per PPO. May coordinates ang bawat record para sa
            future map plotting sa Patrollers.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {analytics.types.map((type) => (
              <button
                key={type.typeKey}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "rounded-xl border bg-background/70 p-4 text-left transition-colors",
                  "border-muted-foreground/15 hover:border-amber-500/40 hover:bg-amber-500/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-medium leading-snug">{type.establishmentType}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {type.ppoBreakdown.length} PPO{type.ppoBreakdown.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Building2 className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{type.total.toLocaleString("en-PH")}</p>
              </button>
            ))}
          </div>

          {topTypes.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Top types: {topTypes.map((type) => `${type.establishmentType} (${type.total})`).join(" · ")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={selectedType != null}
        onOpenChange={(open) => {
          if (!open) setSelectedType(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedType?.establishmentType}</DialogTitle>
            <DialogDescription>
              {selectedType?.total.toLocaleString("en-PH")} establishments · breakdown by PPO
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedType ? <PpoBreakdownTable rows={selectedType.ppoBreakdown} /> : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
