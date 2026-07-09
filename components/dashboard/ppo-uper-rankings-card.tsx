"use client"

import { useMemo, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Medal } from "lucide-react"

import { formatUperRating } from "@/lib/uper-config"
import type { PpoUperAnalytics, PpoUperRow } from "@/lib/ppo-uper-types"
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type PpoUperRankingsCardProps = {
  analytics: PpoUperAnalytics
}

const chartConfig = {
  totalPoints: {
    label: "Total Points",
    color: "hsl(160 60% 42%)",
  },
  derivedRank: {
    label: "Rank",
    color: "hsl(221 83% 53%)",
  },
}

function formatDateDesignated(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || "—"

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function rankAccent(rank: number) {
  if (rank === 1) return "text-amber-600 dark:text-amber-400"
  if (rank === 2) return "text-slate-500 dark:text-slate-300"
  if (rank === 3) return "text-orange-700 dark:text-orange-400"
  return "text-muted-foreground"
}

export function PpoUperRankingsCard({ analytics }: PpoUperRankingsCardProps) {
  const [selectedPpo, setSelectedPpo] = useState<PpoUperRow | null>(null)

  const trendSeries = useMemo(() => {
    if (!selectedPpo) return []

    const key = selectedPpo.ppo.trim()
    return (
      analytics.trendByPpo.find((series) => series.ppo.trim() === key)?.points.map((point) => ({
        ...point,
        ratingLabel: formatUperRating(point.rating),
      })) ?? []
    )
  }, [analytics.trendByPpo, selectedPpo])

  if (!analytics.dataReady || analytics.rankings.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>PPO UPER Rankings</CardTitle>
          <CardDescription>
            Walang PPO UPER data pa. Mag-upload ng UPER of PPOs.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Medal className="size-5 text-emerald-600 dark:text-emerald-400" />
                PPO UPER Rankings
              </CardTitle>
              <CardDescription>
                Provincial Police Office performance · {analytics.currentMonth?.monthLabel}
              </CardDescription>
            </div>
            <Badge variant="outline">{analytics.rankings.length} PPOs</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-3 font-medium">Rank</th>
                  <th className="pb-3 pr-3 font-medium">PPO</th>
                  <th className="pb-3 pr-3 font-medium">Provincial Director</th>
                  <th className="pb-3 pr-3 font-medium">KRA</th>
                  <th className="pb-3 pr-3 font-medium">Behavior</th>
                  <th className="pb-3 pr-3 font-medium">Compliance</th>
                  <th className="pb-3 pr-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics.rankings.map((row) => (
                  <tr
                    key={row.ppo}
                    className="cursor-pointer border-b transition hover:bg-muted/40 last:border-0"
                    onClick={() => setSelectedPpo(row)}
                  >
                    <td className={cn("py-3 pr-3 font-semibold tabular-nums", rankAccent(row.derivedRank))}>
                      {row.derivedRankLabel}
                    </td>
                    <td className="py-3 pr-3 font-medium">{row.ppo} PPO</td>
                    <td className="py-3 pr-3">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.rankDesignation} · designated {formatDateDesignated(row.dateDesignated)}
                      </div>
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{row.kraPoints.toFixed(3)}</td>
                    <td className="py-3 pr-3 tabular-nums">{row.behaviorPoints.toFixed(1)}</td>
                    <td className="py-3 pr-3 tabular-nums">{row.compliancePoints.toFixed(3)}</td>
                    <td className="py-3 pr-3 font-semibold tabular-nums">{row.totalPoints.toFixed(3)}</td>
                    <td className="py-3">
                      <Badge variant="secondary">{formatUperRating(row.rating)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            I-click ang row para makita ang monthly trend ng PPO. Magdagdag ng bagong buwan sheet sa
            workbook at i-upload ulit para ma-update.
          </p>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedPpo)} onOpenChange={(open) => !open && setSelectedPpo(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPpo?.ppo} PPO · {selectedPpo?.name}
            </DialogTitle>
            <DialogDescription>
              Monthly UPER points and rank movement across uploaded sheets.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedPpo ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Current Rank</p>
                  <p className="font-semibold">{selectedPpo.derivedRankLabel}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Total Points</p>
                  <p className="font-semibold">{selectedPpo.totalPoints.toFixed(3)}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold">{formatUperRating(selectedPpo.rating)}</p>
                </div>
              </div>
            ) : null}

            {trendSeries.length > 1 ? (
              <ChartContainer config={chartConfig} className="aspect-[16/10] w-full">
                <LineChart data={trendSeries} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="points"
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <YAxis
                    yAxisId="rank"
                    orientation="right"
                    reversed
                    domain={[1, "dataMax"]}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => {
                          const row = item.payload as (typeof trendSeries)[number]
                          if (name === "totalPoints") {
                            return [
                              `${row.totalPoints.toFixed(3)} (${formatUperRating(row.rating)})`,
                              "Total Points",
                            ]
                          }
                          if (name === "derivedRank") {
                            return [`${row.derivedRankLabel}`, "Rank"]
                          }
                          return [value, name]
                        }}
                      />
                    }
                  />
                  <Line
                    yAxisId="points"
                    type="monotone"
                    dataKey="totalPoints"
                    stroke="var(--color-totalPoints)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--color-totalPoints)" }}
                  />
                  <Line
                    yAxisId="rank"
                    type="monotone"
                    dataKey="derivedRank"
                    stroke="var(--color-derivedRank)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={{ r: 3, fill: "var(--color-derivedRank)" }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                Isang buwan pa lang ang na-upload. Magdagdag ng susunod na sheet (hal. June 2026) para
                makita ang trend chart.
              </p>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
