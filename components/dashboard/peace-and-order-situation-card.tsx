import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CrimeComparativeResult } from "@/lib/crime-comparative"
import { cn } from "@/lib/utils"

type PeaceAndOrderSituationCardProps = {
  result: CrimeComparativeResult | null
  /** Shown when crime data is not ready / no comparison available. */
  emptyMessage?: string
}

function ChangePanel({ result }: { result: CrimeComparativeResult }) {
  const colorClass =
    result.direction === "up"
      ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
      : result.direction === "down"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : "border-border bg-muted/40 text-muted-foreground"

  const Icon =
    result.direction === "up"
      ? ArrowUpRight
      : result.direction === "down"
        ? ArrowDownRight
        : Minus

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border px-4 py-5 text-center sm:px-6",
        colorClass,
      )}
    >
      <Icon className="mb-2 size-6" />
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">Index crime change</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
        {result.changePct != null ? `${Math.abs(result.changePct)}%` : "—"}
      </p>
      <p className="mt-1 text-xs opacity-90">
        {result.direction === "up"
          ? "Mas mataas ang period in review"
          : result.direction === "down"
            ? "Mas mababa ang period in review"
            : "Parehong level"}
        {" · "}
        {result.change >= 0 ? "+" : ""}
        {result.change.toLocaleString()} incidents
      </p>
    </div>
  )
}

export function PeaceAndOrderSituationCard({
  result,
  emptyMessage = "Walang index crime records pa. Mag-upload sa RIDMD para lumabas ang Peace and Order Situation.",
}: PeaceAndOrderSituationCardProps) {
  if (!result) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-5 text-muted-foreground" />
            Peace and Order Situation
          </CardTitle>
          <CardDescription>Index crime · previous month vs period in review</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-5 text-primary" />
              Peace and Order Situation
            </CardTitle>
            <CardDescription>
              Index crime · latest month vs previous month (same day cut-off)
            </CardDescription>
          </div>
          <Link
            href="/ridmd"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            View full RIDMD comparison
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <Card className="gap-0 overflow-hidden border-orange-500/20 bg-orange-500/5 py-0 shadow-none">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Period A</CardTitle>
                <Badge
                  variant="outline"
                  className="border-orange-500/30 text-orange-700 dark:text-orange-300"
                >
                  Previous period
                </Badge>
              </div>
              <CardDescription className="text-xs">{result.periodA.label}</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <p className="text-3xl font-bold tabular-nums text-orange-600 dark:text-orange-400 sm:text-4xl">
                {result.periodA.totalVolume.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">index crimes</p>
            </CardContent>
          </Card>

          <ChangePanel result={result} />

          <Card className="gap-0 overflow-hidden border-sky-500/20 bg-sky-500/5 py-0 shadow-none">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Period B</CardTitle>
                <Badge
                  variant="outline"
                  className="border-sky-500/30 text-sky-700 dark:text-sky-300"
                >
                  Period in review
                </Badge>
              </div>
              <CardDescription className="text-xs">{result.periodB.label}</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <p className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400 sm:text-4xl">
                {result.periodB.totalVolume.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">index crimes</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
