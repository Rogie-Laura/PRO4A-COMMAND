"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { chartConfig, chartData } from "@/lib/analytics-data"

export function OverviewChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Traffic Overview</CardTitle>
        <CardDescription>Visitors, page views, and sessions — last 9 days</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full sm:h-[300px]">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillPageViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-pageViews)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-pageViews)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="var(--color-visitors)"
              fill="url(#fillVisitors)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="pageViews"
              stroke="var(--color-pageViews)"
              fill="url(#fillPageViews)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
