"use client"

import { useMemo, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

import { formatUperRating } from "@/lib/uper-config"
import type { UperAnalytics } from "@/lib/uper-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type UperCurrentRankingCardProps = {
  analytics: UperAnalytics
  compact?: boolean
}

const chartConfig = {
  rankNumber: {
    label: "Ranking",
    color: "hsl(221 83% 53%)",
  },
  points: {
    label: "Points",
    color: "hsl(160 60% 42%)",
  },
}

export function UperCurrentRankingCard({ analytics, compact = false }: UperCurrentRankingCardProps) {
  const [open, setOpen] = useState(false)
  const current = analytics.current

  const chartData = useMemo(
    () =>
      analytics.trend.map((point) => ({
        ...point,
        ratingLabel: formatUperRating(point.rating),
      })),
    [analytics.trend],
  )

  if (!analytics.dataReady || !current) {
    return (
      <Card
        className={cn(
          "border-dashed border-muted-foreground/25 bg-muted/10",
          compact ? "h-full w-full" : "max-w-md",
        )}
      >
        <CardHeader>
          <CardTitle>Current Ranking</CardTitle>
          <CardDescription>
            Walang UPER data pa. Mag-upload ng DPL workbook sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("block text-left", compact ? "h-full w-full" : "max-w-md")}
      >
        <Card
          className={cn(
            "h-full border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card transition hover:border-sky-500/40 hover:shadow-md",
            compact && "w-full",
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Current Ranking</CardTitle>
                <CardDescription>{analytics.focusOffice} · UPER from DPL</CardDescription>
              </div>
              <TrendingUp className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-4xl font-bold tracking-tight text-sky-700 dark:text-sky-300">
                {current.rankLabel}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                of {current.totalPros} PROs
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-background/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">Total Points</p>
                <p className="font-semibold">{current.points.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-background/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="font-semibold">
                  {current.rating} · {formatUperRating(current.rating)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              As of {current.monthLabel}. I-click para makita ang ranking trend.
            </p>
          </CardContent>
        </Card>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{analytics.focusOffice} Ranking Trend</DialogTitle>
            <DialogDescription>
              Monthly UPER ranking movement across all uploaded sheets.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ChartContainer config={chartConfig} className="aspect-[16/10] w-full">
              <LineChart data={chartData} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="rank"
                  reversed
                  domain={[1, "dataMax"]}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  label={{ value: "Rank", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="points"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        const row = item.payload as (typeof chartData)[number]
                        if (name === "rankNumber") {
                          return [`${row.rankLabel} of ${current.totalPros}`, "Ranking"]
                        }
                        if (name === "points") {
                          return [`${row.points.toFixed(2)} (${row.rating} · ${row.ratingLabel})`, "Points"]
                        }
                        return [value, name]
                      }}
                    />
                  }
                />
                <Line
                  yAxisId="rank"
                  type="monotone"
                  dataKey="rankNumber"
                  stroke="var(--color-rankNumber)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--color-rankNumber)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="points"
                  type="monotone"
                  dataKey="points"
                  stroke="var(--color-points)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 3, fill: "var(--color-points)" }}
                />
              </LineChart>
            </ChartContainer>
            <p className="mt-3 text-xs text-muted-foreground">
              Mas mababa ang rank number, mas mataas ang posisyon. Green dashed line = total earned points.
            </p>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
