import Link from "next/link"
import { Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const ZERO_COUNTS: StrengthCounts = { pco: 0, pnco: 0, nup: 0, total: 0 }

function formatNumber(value: number) {
  return value.toLocaleString()
}

function CountCells({ counts, emphasize = false }: { counts: StrengthCounts; emphasize?: boolean }) {
  const values = [counts.pco, counts.pnco, counts.nup, counts.total]

  return (
    <>
      {values.map((value, index) => (
        <td
          key={index}
          className={cn(
            "px-2 py-1 text-right text-xs tabular-nums sm:text-sm",
            emphasize && "font-semibold",
            index === 3 && "font-semibold",
          )}
        >
          {formatNumber(value)}
        </td>
      ))}
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
  const rows =
    items.length > 0 ? items : [{ category: "", counts: ZERO_COUNTS }]

  return (
    <>
      {rows.map((item, index) => (
        <tr
          key={`${prefix}-${item.category || "zero"}-${index}`}
          className={cn(
            "border-b border-border/40",
            tone === "gain" ? "bg-emerald-500/5" : "bg-red-500/5",
          )}
        >
          <td className="px-2 py-1 text-xs sm:text-sm">
            <span className="text-muted-foreground">{prefix}</span>
            {item.category ? (
              <>
                {" "}
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
              </>
            ) : null}
          </td>
          <CountCells counts={item.counts} />
        </tr>
      ))}
    </>
  )
}

export function PersonnelGainsLossesCard({ data }: PersonnelGainsLossesCardProps) {
  if (!data?.dataReady || !data.opening || !data.closing) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="size-4 text-muted-foreground" />
            Personnel Gains and Losses
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 pt-0">
          <p className="text-xs text-muted-foreground">
            Walang G&amp;L data pa. Mag-upload sa{" "}
            <Link href="/rprmd/upload" className="font-medium text-primary underline-offset-4 hover:underline">
              RPRMD → Upload File
            </Link>
            .
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
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-primary" />
          Personnel Gains and Losses
        </CardTitle>
        <p
          className={cn(
            "text-xs font-semibold tabular-nums",
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
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="overflow-x-auto rounded-md border border-border/60">
          <table className="w-full min-w-[28rem] border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-2 py-1 text-left text-[11px] font-medium text-muted-foreground" />
                <th className="px-2 py-1 text-right text-[11px] font-medium text-muted-foreground">
                  PCOs
                </th>
                <th className="px-2 py-1 text-right text-[11px] font-medium text-muted-foreground">
                  PNCOs
                </th>
                <th className="px-2 py-1 text-right text-[11px] font-medium text-muted-foreground">
                  NUP
                </th>
                <th className="px-2 py-1 text-right text-[11px] font-medium text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40 bg-orange-500/5">
                <td className="px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 sm:text-sm">
                  {data.opening.asOf}
                </td>
                <CountCells counts={data.opening.counts} emphasize />
              </tr>

              <MovementRows prefix="add:" items={data.gains} tone="gain" />

              <MovementRows prefix="less:" items={data.losses} tone="loss" />

              <tr className="bg-sky-500/5">
                <td className="px-2 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 sm:text-sm">
                  {data.closing.asOf}
                </td>
                <CountCells counts={data.closing.counts} emphasize />
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Gains {formatNumber(gainTotals.total)} · Losses {formatNumber(lossTotals.total)}
        </p>
      </CardContent>
    </Card>
  )
}
