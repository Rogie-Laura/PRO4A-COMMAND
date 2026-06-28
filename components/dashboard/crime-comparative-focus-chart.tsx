"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, XAxis, YAxis } from "recharts"

import {
  ComparativeBarTotalLabel,
  comparativeBarChartConfig,
  createPeriodBChangeLabel,
  type ComparativeBarRow,
} from "@/components/dashboard/crime-comparative-chart-utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

function truncateCrimeLabel(label: string, compact: boolean) {
  if (!compact) return label.length > 28 ? `${label.slice(0, 28)}…` : label
  return label.length > 16 ? `${label.slice(0, 16)}…` : label
}

function FocusCrimeAxisTick({
  compact,
  chartData,
  ...props
}: {
  compact: boolean
  chartData: ComparativeBarRow[]
  x?: number | string
  y?: number | string
  payload?: { value?: string }
}) {
  const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
  const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
  const row = chartData.find((item) => item.label === props.payload?.value)
  if (!row) return null

  const text = truncateCrimeLabel(row.label, compact)

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="currentColor" fontSize={10}>
        <title>{row.label}</title>
        {text}
      </text>
    </g>
  )
}

type ComparativeFocusCrimeChartProps = {
  rows: ComparativeBarRow[]
  isMobile: boolean
  height?: number
}

export function ComparativeFocusCrimeChart({
  rows,
  isMobile,
  height = 400,
}: ComparativeFocusCrimeChartProps) {
  const chartMinWidth = useMemo(() => {
    if (!isMobile || rows.length === 0) return undefined
    return Math.max(360, rows.length * 96 + 56)
  }, [isMobile, rows.length])

  const periodBChangeLabel = useMemo(() => createPeriodBChangeLabel(rows), [rows])

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Walang focus crime data sa napiling date ranges.
      </p>
    )
  }

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain">
      <ChartContainer
        config={comparativeBarChartConfig}
        className="aspect-auto"
        style={{
          height,
          minWidth: chartMinWidth ?? "100%",
          width: chartMinWidth ?? "100%",
        }}
        initialDimension={{
          width: chartMinWidth ?? (isMobile ? 360 : 720),
          height,
        }}
      >
        <BarChart
          data={rows}
          margin={{ top: 72, right: isMobile ? 12 : 8, left: 0, bottom: 8 }}
          barCategoryGap={isMobile ? "24%" : "20%"}
          barGap={isMobile ? 3 : 6}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            height={isMobile ? 72 : 64}
            tick={(props) => <FocusCrimeAxisTick {...props} chartData={rows} compact={isMobile} />}
          />
          <YAxis tickLine={false} axisLine={false} width={44} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={isMobile ? { paddingTop: 8 } : undefined} />
          <Bar
            dataKey="periodA"
            name="Previous period"
            fill="var(--color-periodA)"
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 34 : 48}
          >
            <LabelList dataKey="periodA" content={<ComparativeBarTotalLabel />} />
          </Bar>
          <Bar
            dataKey="periodB"
            name="Period in review"
            fill="var(--color-periodB)"
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 34 : 48}
          >
            <LabelList dataKey="periodB" content={periodBChangeLabel} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
