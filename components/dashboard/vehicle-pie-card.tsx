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
import type { VehicleChartPoint } from "@/lib/mobility-types"

type VehiclePieCardProps = {
  title: string
  description: string
  data: VehicleChartPoint[]
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function VehiclePieCard({ title, description, data }: VehiclePieCardProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  )

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.map((item, index) => [
          item.name,
          {
            label: item.name,
            color: CHART_COLORS[index % CHART_COLORS.length],
          },
        ]),
      ),
    [data],
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No vehicle data yet.</p>
        ) : (
          <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(160px,200px)]">
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
                  {data.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
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
