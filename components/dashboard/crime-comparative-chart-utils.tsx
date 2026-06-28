"use client"

import type { CrimeFocusComparativeRow } from "@/lib/crime-comparative"

export const comparativeBarChartConfig = {
  periodA: { label: "Previous period", color: "hsl(33 95% 72%)" },
  periodB: { label: "Period in review", color: "hsl(205 85% 72%)" },
}

export type ComparativeBarRow = {
  label: string
  shortLabel?: string
  periodA: number
  periodB: number
  change: number
  changePct: number | null
  changeDirection: CrimeFocusComparativeRow["changeDirection"]
}

type AxisScale = {
  scale: ((value: string | number) => number) & { bandwidth?: () => number }
}

export type ComparativeChangeOverlayProps = {
  chartData: ComparativeBarRow[]
  xAxisMap?: Record<string, AxisScale>
  yAxisMap?: Record<string, AxisScale>
  barSeriesCount?: number
}

export function ComparativeChangeOverlay({
  chartData,
  xAxisMap,
  yAxisMap,
  barSeriesCount = 2,
}: ComparativeChangeOverlayProps) {
  const xAxis = Object.values(xAxisMap ?? {})[0]
  const yAxis = Object.values(yAxisMap ?? {})[0]
  if (!xAxis?.scale || !yAxis?.scale) return null

  const yBaseline = yAxis.scale(0)
  const bandwidth = xAxis.scale.bandwidth?.() ?? 0
  const innerGap = 6
  const barWidth = Math.max(8, (bandwidth - innerGap) / barSeriesCount)

  return (
    <g className="comparative-change-overlay">
      {chartData.map((row) => {
        if (!row.changeDirection) return null

        const bandStart = xAxis.scale(row.label)
        if (!Number.isFinite(bandStart)) return null

        const barCenterX = bandStart + barWidth + innerGap / 2 + barWidth / 2
        const barTop = yAxis.scale(row.periodB)
        const barHeight = yBaseline - barTop

        let labelY = yBaseline - 10
        if (row.periodB > 0 && barHeight > 0 && barHeight < 28) {
          labelY = barTop + Math.max(10, barHeight / 2 + 4)
        }

        const color =
          row.changeDirection === "up"
            ? "#dc2626"
            : row.changeDirection === "down"
              ? "#059669"
              : "#737373"

        const arrow =
          row.changeDirection === "up" ? "↑" : row.changeDirection === "down" ? "↓" : "—"
        const changeCount = Math.abs(row.change).toLocaleString()
        const pctPart = row.changePct != null ? ` · ${Math.abs(row.changePct)}%` : ""

        return (
          <text key={row.label} x={barCenterX} y={labelY} textAnchor="middle" fill={color}>
            <tspan fontSize={16} fontWeight={800} dy={0}>
              {arrow}
            </tspan>
            <tspan fontSize={11} fontWeight={700} dx={3}>
              {changeCount}
              {pctPart}
            </tspan>
          </text>
        )
      })}
    </g>
  )
}

export function ComparativeBarTotalLabel(props: {
  x?: number | string
  y?: number | string
  width?: number | string
  value?: number | string
}) {
  const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
  const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
  const width = typeof props.width === "number" ? props.width : Number(props.width ?? 0)
  const value = typeof props.value === "number" ? props.value : Number(props.value ?? 0)

  if (!Number.isFinite(value) || value <= 0) return null

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      className="fill-foreground"
      fontSize={11}
      fontWeight={700}
    >
      {value.toLocaleString()}
    </text>
  )
}
