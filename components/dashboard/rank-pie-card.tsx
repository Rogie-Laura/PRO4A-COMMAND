"use client"

import { useMemo } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getRankChartColor, type RankChartVariant } from "@/lib/rank-chart-colors"
import type { RankChartPoint } from "@/lib/personnel-types"

type RankPieCardProps = {
  title: string
  description: string
  data: RankChartPoint[]
  variant: RankChartVariant
}

function slugifyRank(rank: string) {
  return rank.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

export function RankPieCard({ title, description, data, variant }: RankPieCardProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  )

  const coloredData = useMemo(
    () =>
      data.map((item, index) => {
        const colors = getRankChartColor(item.rank, variant, index)
        return {
          ...item,
          colors,
          gradientId: `rank-${variant}-${slugifyRank(item.rank)}-${index}`,
        }
      }),
    [data, variant],
  )

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        coloredData.map((item) => [
          item.rank,
          {
            label: item.rank,
            color: item.colors.base,
          },
        ]),
      ),
    [coloredData],
  )

  return (
    <Card className="h-full overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No personnel data.</p>
        ) : (
          <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(180px,220px)]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[240px] w-full max-w-[300px]"
            >
              <PieChart>
                <defs>
                  {coloredData.map((item) => (
                    <linearGradient
                      key={item.gradientId}
                      id={item.gradientId}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={item.colors.highlight} />
                      <stop offset="100%" stopColor={item.colors.base} />
                    </linearGradient>
                  ))}
                </defs>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="rank" />} />
                <Pie
                  data={coloredData}
                  dataKey="count"
                  nameKey="rank"
                  innerRadius={58}
                  outerRadius={102}
                  paddingAngle={3}
                  cornerRadius={4}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {coloredData.map((item) => (
                    <Cell key={item.rank} fill={`url(#${item.gradientId})`} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null

                      const cx = viewBox.cx as number
                      const cy = viewBox.cy as number

                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={cx}
                            dy="-0.35em"
                            fill="var(--muted-foreground)"
                            fontSize={11}
                          >
                            Total
                          </tspan>
                          <tspan
                            x={cx}
                            dy="1.35em"
                            fill="var(--foreground)"
                            fontSize={22}
                            fontWeight={700}
                          >
                            {total.toLocaleString()}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-2">
              {coloredData.map((item) => {
                const percentage =
                  total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0

                return (
                  <div
                    key={item.rank}
                    className="flex items-center justify-between gap-3 rounded-md px-1 py-0.5 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="size-3 shrink-0 rounded-full ring-1 ring-border/60"
                        style={{
                          background: `linear-gradient(135deg, ${item.colors.highlight}, ${item.colors.base})`,
                        }}
                      />
                      <span className="font-medium">{item.rank}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-semibold tabular-nums text-foreground">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums text-primary">{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
