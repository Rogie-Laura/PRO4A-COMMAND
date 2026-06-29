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

type MobilityBarChartItem = {
  name: string
  count: number
  fill?: string
}

type MobilityBarChartCardProps = {
  title: string
  description: string
  data: MobilityBarChartItem[]
  emptyMessage?: string
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
]

export function MobilityBarChartCard({
  title,
  description,
  data,
  emptyMessage = "Walang data pa.",
}: MobilityBarChartCardProps) {
  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        fill: item.fill ?? COLORS[index % COLORS.length],
      })),
    [data],
  )

  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.count, 0), [chartData])

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        chartData.map((item) => [item.name, { label: item.name, color: item.fill }]),
      ),
    [chartData],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={11}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={48} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                {chartData.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  className="fill-foreground text-[10px] font-semibold tabular-nums"
                  formatter={(value) =>
                    typeof value === "number" ? value.toLocaleString() : String(value)
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
