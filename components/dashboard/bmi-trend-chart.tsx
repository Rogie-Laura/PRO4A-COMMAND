"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { BmiTrendPoint } from "@/lib/health-types"

type BmiTrendChartProps = {
  points: BmiTrendPoint[]
}

const chartConfig = {
  weightKg: {
    label: "Weight (kg)",
    color: "hsl(199 89% 48%)",
  },
  bmiResult: {
    label: "BMI",
    color: "hsl(346 77% 50%)",
  },
}

export function BmiTrendChart({ points }: BmiTrendChartProps) {
  const data = useMemo(
    () =>
      points.map((point) => ({
        label: point.monthLabel,
        weightKg: point.weightKg,
        bmiResult: point.bmiResult,
        categoryLabel: point.categoryLabel,
      })),
    [points],
  )

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No trend data available for this person yet.
      </div>
    )
  }

  if (data.length === 1) {
    const only = data[0]!
    return (
      <div className="rounded-lg border bg-muted/10 p-4 text-sm">
        <p className="font-medium">{only.label}</p>
        <p className="mt-1 text-muted-foreground">
          {only.weightKg != null ? `${only.weightKg.toLocaleString()} kg` : "No weight"} ·{" "}
          BMI {only.bmiResult != null ? only.bmiResult.toFixed(1) : "—"}
          {only.categoryLabel ? ` · ${only.categoryLabel}` : ""}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Only one month is recorded — upload another month to see a trend line.
        </p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
      <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          interval={0}
        />
        <YAxis
          yAxisId="weight"
          orientation="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          width={40}
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        <YAxis
          yAxisId="bmi"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          width={36}
          domain={["dataMin - 1", "dataMax + 1"]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "weightKg") {
                  return typeof value === "number" ? `${value.toLocaleString()} kg` : String(value)
                }
                if (name === "bmiResult") {
                  return typeof value === "number" ? value.toFixed(1) : String(value)
                }
                return String(value)
              }}
            />
          }
        />
        <Line
          yAxisId="weight"
          dataKey="weightKg"
          type="monotone"
          stroke="var(--color-weightKg)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          yAxisId="bmi"
          dataKey="bmiResult"
          type="monotone"
          stroke="var(--color-bmiResult)"
          strokeWidth={2.5}
          strokeDasharray="5 4"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  )
}
