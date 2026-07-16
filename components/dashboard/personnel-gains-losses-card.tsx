import Link from "next/link"
import { Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sumStrengthCounts } from "@/lib/personnel-gains-losses-parser"
import type {
  PersonnelGainLossLine,
  PersonnelGainsLosses,
  StrengthCounts,
} from "@/lib/personnel-gains-losses-types"
import { cn } from "@/lib/utils"

type PersonnelGainsLossesCardProps = {
  data: PersonnelGainsLosses | null
}

function formatNumber(value: number) {
  return value.toLocaleString()
}

function CountCells({
  counts,
  emphasize = false,
  muteZeros = false,
}: {
  counts: StrengthCounts
  emphasize?: boolean
  muteZeros?: boolean
}) {
  const values = [counts.pco, counts.pnco, counts.nup, counts.total]

  return (
    <>
      {values.map((value, index) => {
        const muted = muteZeros && value === 0
        return (
          <td
            key={index}
            className={cn(
              "px-3 py-2 text-right tabular-nums",
              emphasize && "font-semibold",
              index === 3 && "font-semibold",
              muted && "text-muted-foreground/50",
            )}
          >
            {muted ? "—" : formatNumber(value)}
          </td>
        )
      })}
    </>
  )
}

function MovementRows({
  prefix,
  items,
  tone,
}: {
  prefix: "add:" | "less:"
  items: PersonnelGainLossLine[]
  tone: "gain" | "loss"
}) {
  if (items.length === 0) {
    return (
      <tr className="border-b border-border/40">
        <td className="px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">{prefix}</span>{" "}
          {tone === "gain" ? "Walang gain" : "Walang loss"}
        </td>
        <td className="px-3 py-2 text-right text-muted-foreground/50">—</td>
        <td className="px-3 py-2 text-right text-muted-foreground/50">—</td>
        <td className="px-3 py-2 text-right text-muted-foreground/50">—</td>
        <td className="px-3 py-2 text-right text-muted-foreground/50">—</td>
      </tr>
    )
  }

  return (
    <>
      {items.map((item) => (
        <tr
          key={`${prefix}-${item.category}`}
          className={cn(
            "border-b border-border/40",
            tone === "gain" ? "bg-emerald-500/5" : "bg-red-500/5",
          )}
        >
          <td className="px-3 py-2 text-sm">
            <span className="font-medium text-foreground/80">{prefix}</span>{" "}
            <span
              className={cn(
                "font-medium",
                tone === "gain"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300",
              )}
            >
              {item.category}
            </span>
          </td>
          <CountCells counts={item.counts} muteZeros />
        </tr>
      ))}
    </>
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
            Walang G&amp;L data pa. Mag-upload ulit ng Alphalist workbook sa{" "}
            <Link href="/rprmd/upload" className="font-medium text-primary underline-offset-4 hover:underline">
              RPRMD → Upload File
            </Link>{" "}
            para makita ang gains at losses.
          </p>
        </CardContent>
      </Card>
    )
  }

  const gainTotals = sumStrengthCounts(data.gains)
  const lossTotals = sumStrengthCounts(data.losses)
  const net = data.closing.counts.total - data.opening.counts.total

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
          <div className="text-right">
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                net > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : net < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground",
              )}
            >
              Net {net > 0 ? "+" : ""}
              {formatNumber(net)}
            </p>
            <Link
              href="/rprmd"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              View RPRMD personnel
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground" />
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">PCOs</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">PNCOs</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">NUP</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40 bg-orange-500/5">
                <td className="px-3 py-2.5 font-medium text-orange-700 dark:text-orange-300">
                  {data.opening.asOf}
                </td>
                <CountCells counts={data.opening.counts} emphasize />
              </tr>

              <MovementRows prefix="add:" items={data.gains} tone="gain" />

              <tr className="border-b border-border/40 bg-muted/20">
                <td className="px-3 py-2 text-sm font-medium text-muted-foreground">Total gains</td>
                <CountCells counts={gainTotals} muteZeros />
              </tr>

              <MovementRows prefix="less:" items={data.losses} tone="loss" />

              <tr className="border-b border-border/40 bg-muted/20">
                <td className="px-3 py-2 text-sm font-medium text-muted-foreground">Total losses</td>
                <CountCells counts={lossTotals} muteZeros />
              </tr>

              <tr className="bg-sky-500/5">
                <td className="px-3 py-2.5 font-medium text-sky-700 dark:text-sky-300">
                  {data.closing.asOf}
                </td>
                <CountCells counts={data.closing.counts} emphasize />
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Gains: {formatNumber(gainTotals.total)} · Losses: {formatNumber(lossTotals.total)} · Source:
          G&amp;L sheet (Part 1)
        </p>
      </CardContent>
    </Card>
  )
}
