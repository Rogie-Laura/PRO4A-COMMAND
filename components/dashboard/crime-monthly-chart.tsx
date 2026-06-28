"use client"

import { useMemo } from "react"
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts"

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
}

const chartConfig = {
  count: {
    label: "Index incidents",
    color: "hsl(346 77% 50%)",
  },
}

const BAR_COLORS = [
  "hsl(346 77% 50%)",
  "hsl(347 70% 58%)",
  "hsl(15 85% 55%)",
  "hsl(35 90% 52%)",
  "hsl(280 65% 55%)",
  "hsl(199 89% 48%)",
  "hsl(160 60% 42%)",
  "hsl(220 70% 55%)",
  "hsl(330 75% 52%)",
  "hsl(45 85% 48%)",
  "hsl(190 75% 45%)",
  "hsl(260 60% 58%)",
]

type ChartRow = CrimeMonthlyCount & {
  barColor: string
  changePct: number | null
  changeDirection: "up" | "down" | "flat" | null
}

function buildChartRows(data: CrimeMonthlyCount[]): ChartRow[] {
  return data.map((item, index) => {
    const previous = index > 0 ? data[index - 1]?.count : null
    let changePct: number | null = null
    let changeDirection: ChartRow["changeDirection"] = null

    if (previous != null && previous > 0) {
      changePct = Math.round(((item.count - previous) / previous) * 1000) / 10
      if (changePct > 0) changeDirection = "up"
      else if (changePct < 0) changeDirection = "down"
      else changeDirection = "flat"
    }

    return {
      ...item,
      barColor: BAR_COLORS[index % BAR_COLORS.length],
      changePct,
      changeDirection,
    }
  })
}

function MonthTick(props: {
  x?: string | number
  y?: string | number
  payload?: { value?: string }
  chartData: ChartRow[]
}) {
  const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
  const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
  const row = props.chartData.find((item) => item.label === props.payload?.value)
  if (!row) return null

  const changeColor =
    row.changeDirection === "up"
      ? "#dc2626"
      : row.changeDirection === "down"
        ? "#059669"
        : "#737373"

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="currentColor" fontSize={12}>
        {row.label}
      </text>
      {row.changePct != null ? (
        <text x={0} y={0} dy={28} textAnchor="middle" fill={changeColor} fontSize={11} fontWeight={600}>
          {row.changeDirection === "up" ? "↑" : row.changeDirection === "down" ? "↓" : "—"}{" "}
          {Math.abs(row.changePct)}%
        </text>
      ) : (
        <text x={0} y={0} dy={28} textAnchor="middle" fill="#737373" fontSize={11}>
          —
        </text>
      )}
    </g>
  )
}

export function CrimeMonthlyChart({ data }: CrimeMonthlyChartProps) {
  const chartData = useMemo(() => buildChartRows(data), [data])

  if (chartData.length === 0) {
    return (
      <Card className="gap-0 py-0">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Monthly Index Crime Distribution</CardTitle>
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
        <CardTitle className="text-base">Monthly Index Crime Distribution</CardTitle>
        <CardDescription>
          Month-over-month change:{" "}
          <span className="text-emerald-600 dark:text-emerald-400">green ↓ bumaba</span>
          {" · "}
          <span className="text-red-600 dark:text-red-400">red ↑ tumaas</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
          <BarChart data={chartData} margin={{ top: 28, right: 12, left: 0, bottom: 8 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={52}
              tick={(props) => <MonthTick {...props} chartData={chartData} />}
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
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
              {chartData.map((row) => (
                <Cell key={row.monthKey} fill={row.barColor} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                className="fill-foreground text-[11px] font-semibold tabular-nums"
                formatter={(value) =>
                  typeof value === "number" ? value.toLocaleString() : String(value)
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
