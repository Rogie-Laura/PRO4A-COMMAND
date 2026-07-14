"use client"

import { useState, type ReactNode } from "react"
import {
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Scale,
  UserMinus,
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
  IntelEligibilityStrength,
  IntelEligibilityUnitRow,
} from "@/lib/intel-eligibility-types"
import { cn } from "@/lib/utils"

type IntelEligibilityCardsProps = {
  analytics: IntelEligibilityAnalytics
}

type DialogView =
  | { kind: "metric"; metric: IntelEligibilityMetricSummary }
  | { kind: "strengthCompare" }

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

const STANDALONE_METRIC_KEYS: IntelEligibilityMetricKey[] = [
  "withTraining",
  "withSeminar",
  "withoutTrainingSeminar",
  "trainingNotInPosition",
]

const METRIC_ICONS: Partial<Record<IntelEligibilityMetricKey, ReactNode>> = {
  withTraining: <GraduationCap className="size-5 text-violet-600 dark:text-violet-400" />,
  withSeminar: <BookOpen className="size-5 text-amber-600 dark:text-amber-400" />,
  withoutTrainingSeminar: <UserMinus className="size-5 text-rose-600 dark:text-rose-400" />,
  trainingNotInPosition: <BadgeCheck className="size-5 text-indigo-600 dark:text-indigo-400" />,
}

const METRIC_ACCENTS: Partial<Record<IntelEligibilityMetricKey, string>> = {
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

function StrengthCompareTable({ rows }: { rows: IntelEligibilityUnitRow[] }) {
  const bodyRows = rows.filter((row) => !row.isTotal)
  const totalRow = rows.find((row) => row.isTotal)

  function renderCompareRow(row: IntelEligibilityUnitRow, isTotal: boolean) {
    const variance = row.actual.total - row.authorized.total
    return (
      <tr key={row.unit} className={cn("border-b last:border-0", isTotal && "bg-muted/20 font-semibold")}>
        <td className={isTotal ? ridStickyLabelTotalCellClass() : ridStickyLabelCellClass()}>
          {row.unit}
        </td>
        <td className={ridDataCellClass()}>{formatCount(row.authorized.pco)}</td>
        <td className={ridDataCellClass()}>{formatCount(row.authorized.pnco)}</td>
        <td className={ridDataCellClass()}>{formatCount(row.authorized.nup)}</td>
        <td className={ridDataCellClass("font-semibold")}>{formatCount(row.authorized.total)}</td>
        <td className={ridDataCellClass()}>{formatCount(row.actual.pco)}</td>
        <td className={ridDataCellClass()}>{formatCount(row.actual.pnco)}</td>
        <td className={ridDataCellClass()}>{formatCount(row.actual.nup)}</td>
        <td className={ridDataCellClass("font-semibold")}>{formatCount(row.actual.total)}</td>
        <td
          className={ridDataCellClass(
            cn(
              "font-semibold",
              variance > 0 && "text-emerald-600 dark:text-emerald-400",
              variance < 0 && "text-rose-600 dark:text-rose-400",
            ),
          )}
        >
          {variance > 0 ? "+" : ""}
          {formatCount(variance)}
        </td>
      </tr>
    )
  }

  return (
    <div className={cn(ridTableWrapperClass, "max-h-[min(60vh,28rem)] bg-muted/10")}>
      <table className={ridDialogTableClass}>
        <thead className="sticky top-0 z-30 bg-muted">
          <tr className="border-b text-muted-foreground">
            <th className={ridStickyLabelHeaderClass()} rowSpan={2}>
              Office/Unit
            </th>
            <th className={ridDataHeaderClass("text-center")} colSpan={4}>
              Authorized
            </th>
            <th className={ridDataHeaderClass("text-center")} colSpan={4}>
              Actual
            </th>
            <th className={ridDataHeaderClass()} rowSpan={2}>
              Diff
            </th>
          </tr>
          <tr className="border-b text-muted-foreground">
            <th className={ridDataHeaderClass()}>PCO</th>
            <th className={ridDataHeaderClass()}>PNCO</th>
            <th className={ridDataHeaderClass()}>NUP</th>
            <th className={ridDataHeaderClass()}>Total</th>
            <th className={ridDataHeaderClass()}>PCO</th>
            <th className={ridDataHeaderClass()}>PNCO</th>
            <th className={ridDataHeaderClass()}>NUP</th>
            <th className={ridDataHeaderClass()}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row) => renderCompareRow(row, false))}
          {totalRow ? renderCompareRow(totalRow, true) : null}
        </tbody>
      </table>
    </div>
  )
}

function StrengthSide({
  label,
  strength,
}: {
  label: string
  strength: IntelEligibilityStrength
}) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{formatCount(strength.total)}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
        <div>
          <p className="text-muted-foreground">PCO</p>
          <p className="font-semibold tabular-nums">{formatCount(strength.pco)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">PNCO</p>
          <p className="font-semibold tabular-nums">{formatCount(strength.pnco)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">NUP</p>
          <p className="font-semibold tabular-nums">{formatCount(strength.nup)}</p>
        </div>
      </div>
    </div>
  )
}

function StrengthCompareCard({
  authorized,
  actual,
  onClick,
}: {
  authorized: IntelEligibilityStrength
  actual: IntelEligibilityStrength
  onClick: () => void
}) {
  const variance = actual.total - authorized.total

  return (
    <button type="button" onClick={onClick} className="block h-full w-full text-left sm:col-span-2">
      <Card className="h-full border-border/60 bg-gradient-to-br from-sky-500/10 via-card to-emerald-500/10 transition hover:shadow-md border-sky-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="size-5 text-sky-700 dark:text-sky-400" />
            Authorized vs Actual Strength
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <StrengthSide label="Authorized Strength" strength={authorized} />
            <StrengthSide label="Actual Strength (A)" strength={actual} />
          </div>
          <p className="text-xs text-muted-foreground">
            Diff (Actual − Authorized):{" "}
            <span
              className={cn(
                "font-semibold tabular-nums",
                variance > 0 && "text-emerald-600 dark:text-emerald-400",
                variance < 0 && "text-rose-600 dark:text-rose-400",
              )}
            >
              {variance > 0 ? "+" : ""}
              {formatCount(variance)}
            </span>
            {" · "}
            I-click para makita ang unit breakdown.
          </p>
        </CardContent>
      </Card>
    </button>
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
  const [dialogView, setDialogView] = useState<DialogView | null>(null)

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

  const authorized = analytics.metrics.find((metric) => metric.key === "authorized")
  const actual = analytics.metrics.find((metric) => metric.key === "actual")
  const standaloneMetrics = analytics.metrics.filter((metric) =>
    STANDALONE_METRIC_KEYS.includes(metric.key),
  )

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
          {authorized && actual ? (
            <StrengthCompareCard
              authorized={authorized.totals}
              actual={actual.totals}
              onClick={() => setDialogView({ kind: "strengthCompare" })}
            />
          ) : null}

          {standaloneMetrics.map((metric) => (
            <SummaryCard
              key={metric.key}
              metric={metric}
              onClick={() => setDialogView({ kind: "metric", metric })}
            />
          ))}
        </div>
      </div>

      <Dialog
        open={dialogView != null}
        onOpenChange={(open) => {
          if (!open) setDialogView(null)
        }}
      >
        <DialogContent className={dialogView?.kind === "strengthCompare" ? "sm:max-w-5xl" : "sm:max-w-3xl"}>
          <DialogHeader>
            <DialogTitle>
              {dialogView?.kind === "strengthCompare"
                ? "Authorized vs Actual Strength"
                : dialogView?.metric.label}
            </DialogTitle>
            <DialogDescription>
              {dialogView?.kind === "strengthCompare"
                ? `${formatCount(authorized?.totals.total ?? 0)} authorized · ${formatCount(actual?.totals.total ?? 0)} actual · by unit`
                : `${formatCount(dialogView?.metric.totals.total ?? 0)} total · PCO/PNCO/NUP by unit`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {dialogView?.kind === "strengthCompare" ? (
              <StrengthCompareTable rows={analytics.units} />
            ) : dialogView?.kind === "metric" ? (
              <BreakdownTable rows={dialogView.metric.unitRows} metricKey={dialogView.metric.key} />
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
