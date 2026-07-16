import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  PersonnelGainLossLine,
  PersonnelGainsLosses,
  PersonnelStrengthSnapshot,
  StrengthCounts,
} from "@/lib/personnel-gains-losses-types"
import { cn } from "@/lib/utils"

type PersonnelGainsLossesCardProps = {
  data: PersonnelGainsLosses | null
}

function formatCounts(counts: StrengthCounts) {
  return `${counts.pco.toLocaleString()} PCO · ${counts.pnco.toLocaleString()} PNCO · ${counts.nup.toLocaleString()} NUP`
}

function StrengthPanel({
  label,
  snapshot,
  tone,
}: {
  label: string
  snapshot: PersonnelStrengthSnapshot
  tone: "opening" | "closing"
}) {
  const toneClass =
    tone === "opening"
      ? "border-orange-500/20 bg-orange-500/5"
      : "border-sky-500/20 bg-sky-500/5"

  const valueClass =
    tone === "opening"
      ? "text-orange-600 dark:text-orange-400"
      : "text-sky-600 dark:text-sky-400"

  return (
    <Card className={cn("gap-0 overflow-hidden py-0 shadow-none", toneClass)}>
      <CardHeader className="border-b border-border/40 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{label}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {tone === "opening" ? "Opening" : "Closing"}
          </Badge>
        </div>
        <CardDescription className="text-xs">{snapshot.asOf}</CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <p className={cn("text-3xl font-bold tabular-nums sm:text-4xl", valueClass)}>
          {snapshot.counts.total.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">total personnel</p>
        <p className="mt-2 text-xs text-muted-foreground">{formatCounts(snapshot.counts)}</p>
      </CardContent>
    </Card>
  )
}

function MovementList({
  title,
  items,
  emptyLabel,
  tone,
}: {
  title: string
  items: PersonnelGainLossLine[]
  emptyLabel: string
  tone: "gain" | "loss"
}) {
  const toneClass =
    tone === "gain"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : "border-red-500/20 bg-red-500/5"

  return (
    <Card className={cn("gap-0 overflow-hidden py-0 shadow-none", toneClass)}>
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${title}-${item.category}`} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{formatCounts(item.counts)}</p>
                </div>
                <p className="shrink-0 text-lg font-semibold tabular-nums">
                  {item.counts.total.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function NetChangePanel({ opening, closing }: { opening: StrengthCounts; closing: StrengthCounts }) {
  const change = closing.total - opening.total
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat"

  const colorClass =
    direction === "up"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : direction === "down"
        ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
        : "border-border bg-muted/40 text-muted-foreground"

  const Icon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border px-4 py-5 text-center sm:px-6",
        colorClass,
      )}
    >
      <Icon className="mb-2 size-6" />
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">Net change</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
        {change > 0 ? "+" : ""}
        {change.toLocaleString()}
      </p>
      <p className="mt-1 text-xs opacity-90">
        {direction === "up"
          ? "Net gain sa personnel strength"
          : direction === "down"
            ? "Net loss sa personnel strength"
            : "Walang net change"}
      </p>
    </div>
  )
}

export function PersonnelGainsLossesCard({ data }: PersonnelGainsLossesCardProps) {
  if (!data?.dataReady || !data.opening || !data.closing) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-5 text-muted-foreground" />
            Personnel Gains and Losses
          </CardTitle>
          <CardDescription>Actual strength snapshot mula sa G&amp;L sheet ng Alphalist workbook</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Walang G&amp;L data pa. Mag-upload ng bagong Alphalist workbook sa{" "}
            <Link href="/rprmd/upload" className="font-medium text-primary underline-offset-4 hover:underline">
              RPRMD → Upload File
            </Link>
            .
          </p>
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
              <Users className="size-5 text-primary" />
              Personnel Gains and Losses
            </CardTitle>
            <CardDescription>{data.title}</CardDescription>
          </div>
          <Link
            href="/rprmd"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            View RPRMD personnel
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <StrengthPanel label="Opening strength" snapshot={data.opening} tone="opening" />
          <NetChangePanel opening={data.opening.counts} closing={data.closing.counts} />
          <StrengthPanel label="Closing strength" snapshot={data.closing} tone="closing" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MovementList title="Gains (add)" items={data.gains} emptyLabel="Walang gain entries." tone="gain" />
          <MovementList
            title="Losses (less)"
            items={data.losses}
            emptyLabel="Walang loss entries."
            tone="loss"
          />
        </div>
      </CardContent>
    </Card>
  )
}
