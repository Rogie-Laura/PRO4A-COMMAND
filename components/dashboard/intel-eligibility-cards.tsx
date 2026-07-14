"use client"

import { useState, type ReactNode } from "react"
import {
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Shield,
  UserMinus,
  Users,
} from "lucide-react"

import {
  ridDataCellClass,
  ridDataHeaderClass,
  ridDialogTableClass,
  ridStickyLabelCellClass,
  ridStickyLabelHeaderClass,
  ridStickyLabelTotalCellClass,
  ridTableWrapperClass,
} from "@/components/dashboard/rid-table-styles"
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
  IntelEligibilityAnalytics,
  IntelEligibilityMetricKey,
  IntelEligibilityMetricSummary,
  IntelEligibilityUnitRow,
} from "@/lib/intel-eligibility-types"
import { cn } from "@/lib/utils"

type IntelEligibilityCardsProps = {
  analytics: IntelEligibilityAnalytics
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

const METRIC_ICONS: Record<IntelEligibilityMetricKey, ReactNode> = {
  authorized: <Shield className="size-5 text-sky-600 dark:text-sky-400" />,
  actual: <Users className="size-5 text-emerald-600 dark:text-emerald-400" />,
  withTraining: <GraduationCap className="size-5 text-violet-600 dark:text-violet-400" />,
  withSeminar: <BookOpen className="size-5 text-amber-600 dark:text-amber-400" />,
  withoutTrainingSeminar: <UserMinus className="size-5 text-rose-600 dark:text-rose-400" />,
  trainingNotInPosition: <BadgeCheck className="size-5 text-indigo-600 dark:text-indigo-400" />,
}

const METRIC_ACCENTS: Record<IntelEligibilityMetricKey, string> = {
  authorized: "from-sky-500/10 border-sky-500/20",
  actual: "from-emerald-500/10 border-emerald-500/20",
  withTraining: "from-violet-500/10 border-violet-500/20",
  withSeminar: "from-amber-500/10 border-amber-500/20",
  withoutTrainingSeminar: "from-rose-500/10 border-rose-500/20",
  trainingNotInPosition: "from-indigo-500/10 border-indigo-500/20",
}

function BreakdownTable({
  rows,
  metricKey,
}: {
  rows: IntelEligibilityUnitRow[]
  metricKey: IntelEligibilityMetricKey
}) {
  const bodyRows = rows.filter((row) => !row.isTotal)
  const totalRow = rows.find((row) => row.isTotal)

  return (
    <div className={cn(ridTableWrapperClass, "max-h-[min(60vh,28rem)] bg-muted/10")}>
      <table className={ridDialogTableClass}>
        <thead className="sticky top-0 z-30 bg-muted">
          <tr className="border-b text-muted-foreground">
            <th className={ridStickyLabelHeaderClass()}>Office/Unit</th>
            <th className={ridDataHeaderClass()}>PCO</th>
            <th className={ridDataHeaderClass()}>PNCO</th>
            <th className={ridDataHeaderClass()}>NUP</th>
            <th className={ridDataHeaderClass()}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row) => {
            const strength = row[metricKey]
            return (
              <tr key={row.unit} className="border-b last:border-0">
                <td className={ridStickyLabelCellClass()}>{row.unit}</td>
                <td className={ridDataCellClass()}>{formatCount(strength.pco)}</td>
                <td className={ridDataCellClass()}>{formatCount(strength.pnco)}</td>
                <td className={ridDataCellClass()}>{formatCount(strength.nup)}</td>
                <td className={ridDataCellClass("font-semibold")}>{formatCount(strength.total)}</td>
              </tr>
            )
          })}
          {totalRow ? (
            <tr className="bg-muted/20 font-semibold">
              <td className={ridStickyLabelTotalCellClass()}>{totalRow.unit}</td>
              <td className={ridDataCellClass()}>{formatCount(totalRow[metricKey].pco)}</td>
              <td className={ridDataCellClass()}>{formatCount(totalRow[metricKey].pnco)}</td>
              <td className={ridDataCellClass()}>{formatCount(totalRow[metricKey].nup)}</td>
              <td className={ridDataCellClass()}>{formatCount(totalRow[metricKey].total)}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

function SummaryCard({
  metric,
  onClick,
}: {
  metric: IntelEligibilityMetricSummary
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="block h-full w-full text-left">
      <Card
        className={cn(
          "h-full border-border/60 bg-gradient-to-br via-card to-card transition hover:shadow-md",
          METRIC_ACCENTS[metric.key],
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {METRIC_ICONS[metric.key]}
            {metric.shortLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-3xl font-bold tabular-nums">{formatCount(metric.totals.total)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border bg-background/70 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">PCO</p>
              <p className="text-sm font-semibold tabular-nums">{formatCount(metric.totals.pco)}</p>
            </div>
            <div className="rounded-lg border bg-background/70 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">PNCO</p>
              <p className="text-sm font-semibold tabular-nums">{formatCount(metric.totals.pnco)}</p>
            </div>
            <div className="rounded-lg border bg-background/70 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">NUP</p>
              <p className="text-sm font-semibold tabular-nums">{formatCount(metric.totals.nup)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">I-click para makita ang unit breakdown.</p>
        </CardContent>
      </Card>
    </button>
  )
}

export function IntelEligibilityCards({ analytics }: IntelEligibilityCardsProps) {
  const [selectedMetric, setSelectedMetric] = useState<IntelEligibilityMetricSummary | null>(null)

  if (!analytics.dataReady || analytics.metrics.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Intelligence Eligibility List</CardTitle>
          <CardDescription>
            Walang IEL data pa. Mag-upload ng Intelligence Eligibility List.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{analytics.title}</Badge>
          {analytics.periodLabel ? (
            <Badge variant="outline" className="font-normal">
              {analytics.periodLabel}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {analytics.metrics.map((metric) => (
            <SummaryCard
              key={metric.key}
              metric={metric}
              onClick={() => setSelectedMetric(metric)}
            />
          ))}
        </div>
      </div>

      <Dialog
        open={selectedMetric != null}
        onOpenChange={(open) => {
          if (!open) setSelectedMetric(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMetric?.label}</DialogTitle>
            <DialogDescription>
              {formatCount(selectedMetric?.totals.total ?? 0)} total · PCO/PNCO/NUP by unit
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedMetric ? (
              <BreakdownTable rows={selectedMetric.unitRows} metricKey={selectedMetric.key} />
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
