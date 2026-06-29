"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

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
  categoryLabel: string
}

const SOURCE_ITEMS = [
  { key: "organic", label: "Organic", color: "var(--chart-1)" },
  { key: "donated", label: "Donated", color: "var(--chart-2)" },
  { key: "loaned", label: "Loaned", color: "var(--chart-3)" },
] as const

export function FirearmsSourceChart({ source, categoryLabel }: FirearmsSourceChartProps) {
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
        <CardDescription>
          {categoryLabel} by acquisition source (Organic · Donated · Loaned)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Walang source breakdown data pa.
          </p>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
              <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  width={48}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={56}>
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    className="fill-foreground text-xs font-semibold tabular-nums"
                    formatter={(value) =>
                      typeof value === "number" ? value.toLocaleString() : String(value)
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-3 text-sm">
              {data.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0

                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-medium">{item.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.count.toLocaleString()} · {percentage}%
                    </span>
                  </div>
                )
              })}
              <div className="flex items-center gap-2 font-semibold">
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
