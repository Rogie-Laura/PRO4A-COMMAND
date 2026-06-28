"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import type { CrimeMonthlyCount } from "@/lib/crime-types"

type CrimeMonthlyChartProps = {
  data: CrimeMonthlyCount[]
  variant: "index" | "non-index"
}

const chartConfigs = {
  index: {
    count: {
      label: "Index incidents",
      color: "hsl(346 77% 50%)",
    },
  },
  "non-index": {
    count: {
      label: "Non-index incidents",
      color: "hsl(199 89% 48%)",
    },
  },
} as const

export function CrimeMonthlyChart({ data, variant }: CrimeMonthlyChartProps) {
  const chartConfig = chartConfigs[variant]

  if (data.length === 0) {
    return (
      <Card className="gap-0 py-0">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Monthly Crime Distribution</CardTitle>
          <CardDescription>Based on date committed (or date reported)</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Walang monthly breakdown — walang valid dates sa records.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Monthly Crime Distribution</CardTitle>
        <CardDescription>Based on date committed (or date reported)</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              interval={0}
              angle={data.length > 6 ? -35 : 0}
              textAnchor={data.length > 6 ? "end" : "middle"}
              height={data.length > 6 ? 56 : 32}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={44} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    typeof value === "number" ? value.toLocaleString() : String(value)
                  }
                />
              }
              cursor={{ fill: "color-mix(in oklch, var(--muted) 45%, transparent)" }}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
