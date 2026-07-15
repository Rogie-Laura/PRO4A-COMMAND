import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ridDataCellClass,
  ridDataHeaderClass,
  ridStickyLabelCellClass,
  ridStickyLabelHeaderClass,
  ridStickyLabelTotalCellClass,
  ridTableClass,
  ridTableWrapperClass,
} from "@/components/dashboard/rid-table-styles"
import { RidCardUploadedAt } from "@/components/dashboard/rid-section-header"
import { getRandomDrugTestGrandTotal } from "@/lib/random-drug-test-analytics"
import type { RandomDrugTestAnalytics } from "@/lib/random-drug-test-types"
import { cn } from "@/lib/utils"

type RandomDrugTestPanelProps = {
  analytics: RandomDrugTestAnalytics
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

function formatPct(part: number, whole: number) {
  if (whole <= 0) return "—"
  return `${Math.round((part / whole) * 1000) / 10}%`
}

function KpiChip({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "emerald" | "rose" | "sky"
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "rose"
        ? "text-rose-700 dark:text-rose-300"
        : "text-sky-700 dark:text-sky-300"

  return (
    <div className="rounded-lg border border-sky-500/20 bg-background/70 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", toneClass)}>
        {formatCount(value)}
      </p>
    </div>
  )
}

export function RandomDrugTestPanel({ analytics }: RandomDrugTestPanelProps) {
  if (!analytics.dataReady || analytics.rows.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Random Drug Test</CardTitle>
          <CardDescription>
            Walang Random Drug Test data pa. Mag-upload ng RANDOM DRUG TEST.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const bodyRows = analytics.rows.filter((row) => !row.isTotal)
  const totalRow = getRandomDrugTestGrandTotal(analytics.rows)
  const tested = totalRow ? totalRow.negative + totalRow.positive : 0

  return (
    <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-card to-card">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{analytics.title}</CardTitle>
        <CardDescription className="space-y-2">
          {analytics.periodLabel ? <span className="block">{analytics.periodLabel}</span> : null}
          <RidCardUploadedAt uploadedAt={analytics.lastUpdated} dataReady={analytics.dataReady} />
          {analytics.note ? (
            <Badge variant="outline" className="font-normal">
              {analytics.note}
            </Badge>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalRow ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiChip label="Total Strength" value={totalRow.totalStrength} />
            <KpiChip label="Tested" value={tested} tone="sky" />
            <KpiChip label="Negative" value={totalRow.negative} tone="emerald" />
            <KpiChip label="Positive" value={totalRow.positive} tone="rose" />
          </div>
        ) : null}

        <div className={ridTableWrapperClass}>
          <table className={ridTableClass}>
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className={ridStickyLabelHeaderClass()}>Unit/Office</th>
                <th className={ridDataHeaderClass()}>Total Strength</th>
                <th className={ridDataHeaderClass()}>Negative</th>
                <th className={ridDataHeaderClass()}>Positive</th>
                <th className={ridDataHeaderClass()}>Tested</th>
                <th className={ridDataHeaderClass()}>% of Strength</th>
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row) => {
                const rowTested = row.negative + row.positive
                return (
                  <tr key={row.unit} className="border-b last:border-0">
                    <td className={ridStickyLabelCellClass()}>{row.unit}</td>
                    <td className={ridDataCellClass()}>{formatCount(row.totalStrength)}</td>
                    <td className={ridDataCellClass("text-emerald-700 dark:text-emerald-300")}>
                      {formatCount(row.negative)}
                    </td>
                    <td
                      className={ridDataCellClass(
                        row.positive > 0
                          ? "font-semibold text-rose-700 dark:text-rose-300"
                          : undefined,
                      )}
                    >
                      {formatCount(row.positive)}
                    </td>
                    <td className={ridDataCellClass()}>{formatCount(rowTested)}</td>
                    <td className={ridDataCellClass()}>
                      {formatPct(rowTested, row.totalStrength)}
                    </td>
                  </tr>
                )
              })}
              {totalRow ? (
                <tr className="border-t bg-muted/20">
                  <td className={ridStickyLabelTotalCellClass()}>{totalRow.unit}</td>
                  <td className={ridDataCellClass("font-semibold")}>
                    {formatCount(totalRow.totalStrength)}
                  </td>
                  <td className={ridDataCellClass("font-semibold text-emerald-700 dark:text-emerald-300")}>
                    {formatCount(totalRow.negative)}
                  </td>
                  <td className={ridDataCellClass("font-semibold text-rose-700 dark:text-rose-300")}>
                    {formatCount(totalRow.positive)}
                  </td>
                  <td className={ridDataCellClass("font-semibold")}>{formatCount(tested)}</td>
                  <td className={ridDataCellClass("font-semibold")}>
                    {formatPct(tested, totalRow.totalStrength)}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
