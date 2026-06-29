"use client"

import { useMemo } from "react"
import { Cell, Pie, PieChart } from "recharts"

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
import type { FirearmsSourceBreakdown } from "@/lib/firearms-types"

type FirearmsSourceChartProps = {
  source: FirearmsSourceBreakdown
}

const SOURCE_ITEMS = [
  { key: "organic", label: "Organic", color: "var(--chart-1)" },
  { key: "donated", label: "Donated", color: "var(--chart-2)" },
  { key: "loaned", label: "Loaned", color: "var(--chart-3)" },
] as const

export function FirearmsSourceChart({ source }: FirearmsSourceChartProps) {
  const data = useMemo(
    () =>
      SOURCE_ITEMS.map((item) => ({
        name: item.label,
        count: source[item.key],
        fill: item.color,
      })),
    [source],
  )

  const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data])

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        SOURCE_ITEMS.map((item) => [
          item.label,
          {
            label: item.label,
            color: item.color,
          },
        ]),
      ),
    [],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Source Breakdown</CardTitle>
        <CardDescription>Short firearms by acquisition source (Organic · Donated · Loaned)</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Walang source breakdown data pa.
          </p>
        ) : (
          <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(180px,220px)]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[220px] w-full max-w-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={96}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-2">
              {data.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0

                return (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.count.toLocaleString()} · {percentage}%
                    </span>
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
