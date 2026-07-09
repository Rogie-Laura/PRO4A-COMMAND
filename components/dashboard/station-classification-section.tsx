"use client"

import { useMemo, useState } from "react"
import { Building2, Landmark, Shield } from "lucide-react"

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
  StationClassificationAnalytics,
  StationClassificationGroup,
  StationClassificationTypeId,
} from "@/lib/station-classification-types"
import { cn } from "@/lib/utils"

type StationClassificationSectionProps = {
  analytics: StationClassificationAnalytics
}

type DialogView =
  | { kind: "group"; group: StationClassificationGroup }
  | { kind: "pmfc" }
  | null

const CLASS_CARD_STYLES: Record<
  StationClassificationTypeId,
  { border: string; bg: string; icon: string }
> = {
  ccps: {
    border: "border-violet-500/30 hover:border-violet-500/50",
    bg: "from-violet-500/15 via-violet-500/5 to-card",
    icon: "text-violet-600 dark:text-violet-400",
  },
  "mps-a": {
    border: "border-sky-500/30 hover:border-sky-500/50",
    bg: "from-sky-500/15 via-sky-500/5 to-card",
    icon: "text-sky-600 dark:text-sky-400",
  },
  "mps-b": {
    border: "border-amber-500/30 hover:border-amber-500/50",
    bg: "from-amber-500/15 via-amber-500/5 to-card",
    icon: "text-amber-700 dark:text-amber-400",
  },
  "mps-c": {
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    bg: "from-emerald-500/15 via-emerald-500/5 to-card",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
}

function UnitList({ units }: { units: { number: number; name: string }[] }) {
  return (
    <div className="max-h-[min(60vh,28rem)] overflow-y-auto rounded-lg border bg-muted/10">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background/95 backdrop-blur">
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">No.</th>
            <th className="px-4 py-3 font-medium">Unit</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={`${unit.number}-${unit.name}`} className="border-b last:border-0">
              <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{unit.number}</td>
              <td className="px-4 py-2.5 font-medium">{unit.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StationClassificationSection({ analytics }: StationClassificationSectionProps) {
  const [dialogView, setDialogView] = useState<DialogView>(null)

  const groupById = useMemo(
    () => new Map(analytics.groups.map((group) => [group.id, group])),
    [analytics.groups],
  )

  if (!analytics.dataReady || !analytics.totals) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Classification of Stations</CardTitle>
          <CardDescription>
            Walang station classification data pa. Mag-upload ng R9 Classification of Stations.xlsx
            sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totals = analytics.totals

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-5 text-primary" />
                Classification of Stations
              </CardTitle>
              <CardDescription>{analytics.asOfLabel}</CardDescription>
            </div>
            <Badge variant="outline">{totals.stations} stations</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="overflow-x-auto rounded-lg border bg-background/70">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">PPO</th>
                  {(["ccps", "mps-a", "mps-b", "mps-c"] as const).map((id) => {
                    const group = groupById.get(id)
                    return (
                      <th key={id} className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => group && setDialogView({ kind: "group", group })}
                          className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition hover:bg-primary/10 hover:text-foreground"
                        >
                          {group?.label ?? id}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {analytics.ppoRows.map((row) => (
                  <tr key={row.ppo} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{row.ppo} PPO</td>
                    <td className="px-4 py-3 tabular-nums">{row.ccps}</td>
                    <td className="px-4 py-3 tabular-nums">{row.mpsA}</td>
                    <td className="px-4 py-3 tabular-nums">{row.mpsB}</td>
                    <td className="px-4 py-3 tabular-nums">{row.mpsC}</td>
                  </tr>
                ))}
                <tr className="bg-muted/20 font-semibold">
                  <td className="px-4 py-3">Grand Total</td>
                  <td className="px-4 py-3 tabular-nums">{totals.ccps}</td>
                  <td className="px-4 py-3 tabular-nums">{totals.mpsA}</td>
                  <td className="px-4 py-3 tabular-nums">{totals.mpsB}</td>
                  <td className="px-4 py-3 tabular-nums">{totals.mpsC}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {analytics.groups.map((group) => {
              const style = CLASS_CARD_STYLES[group.id]
              const count = group.units.length

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setDialogView({ kind: "group", group })}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "h-full border bg-gradient-to-br transition hover:shadow-md",
                      style.border,
                      style.bg,
                    )}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between gap-2 text-base">
                        <span className="flex items-center gap-2">
                          <Building2 className={cn("size-4", style.icon)} />
                          {group.label}
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </CardTitle>
                      <CardDescription>I-click para makita ang linked stations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tabular-nums">{count}</p>
                      <p className="mt-1 text-xs text-muted-foreground">units across CALABARZON</p>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <button type="button" onClick={() => setDialogView({ kind: "pmfc" })} className="block w-full text-left">
        <Card className="border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-card transition hover:border-orange-500/40 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="size-5 text-orange-600 dark:text-orange-400" />
                  PMFC
                </CardTitle>
                <CardDescription>Provincial Mobile Force Companies</CardDescription>
              </div>
              <Badge variant="outline">{totals.pmfc} units</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              I-click para makita ang lahat ng PMFC units na naka-link sa workbook.
            </p>
          </CardContent>
        </Card>
      </button>

      <Dialog open={dialogView !== null} onOpenChange={(open) => !open && setDialogView(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {dialogView?.kind === "pmfc"
                ? "PMFC Units"
                : `${dialogView?.group.label} Stations`}
            </DialogTitle>
            <DialogDescription>
              {dialogView?.kind === "pmfc"
                ? `${analytics.pmfcUnits.length} Provincial Mobile Force Companies`
                : `${dialogView?.group.units.length ?? 0} linked stations from classification workbook`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {dialogView?.kind === "pmfc" ? (
              <UnitList units={analytics.pmfcUnits} />
            ) : dialogView?.kind === "group" ? (
              <UnitList units={dialogView.group.units} />
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
