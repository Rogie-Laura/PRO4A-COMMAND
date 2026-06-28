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

export function formatComparativeChangeLabel(row: ComparativeBarRow) {
  const color =
    row.changeDirection === "up"
      ? "#dc2626"
      : row.changeDirection === "down"
        ? "#059669"
        : "#737373"

  const arrow =
    row.changeDirection === "up" ? "↑" : row.changeDirection === "down" ? "↓" : "—"
  const changeCount = Math.abs(row.change).toLocaleString()
  const pctPart = row.changePct != null ? ` · ${Math.abs(row.changePct)}%` : row.changeDirection === "flat" ? " · 0%" : ""

  return { color, text: `${arrow} ${changeCount}${pctPart}` }
}

export function ComparativeBarTotalLabel(props: {
  x?: number | string
  y?: number | string
  width?: number | string
  value?: number | string
  offset?: number
}) {
  const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
  const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
  const width = typeof props.width === "number" ? props.width : Number(props.width ?? 0)
  const value = typeof props.value === "number" ? props.value : Number(props.value ?? 0)
  const offset = props.offset ?? 6

  if (!Number.isFinite(value)) return null

  return (
    <text
      x={x + width / 2}
      y={y - offset}
      textAnchor="middle"
      className="fill-foreground"
      fontSize={11}
      fontWeight={700}
    >
      {value.toLocaleString()}
    </text>
  )
}

function renderChangeLabelText(
  centerX: number,
  y: number,
  row: ComparativeBarRow,
  compact?: boolean,
) {
  const { color, text } = formatComparativeChangeLabel(row)
  const arrow = text.split(" ")[0] ?? "—"
  const rest = text.slice(arrow.length).trim()

  return (
    <text x={centerX} y={y} textAnchor="middle" fill={color}>
      <tspan fontSize={compact ? 14 : 16} fontWeight={800} dy={0}>
        {arrow}
      </tspan>
      {rest ? (
        <tspan fontSize={compact ? 10 : 11} fontWeight={700} dx={3}>
          {rest}
        </tspan>
      ) : null}
    </text>
  )
}

export type PeriodBLabelPlacement = "insideBottom" | "aboveTotal"

export function createPeriodBBarLabels(
  chartData: ComparativeBarRow[],
  placement: PeriodBLabelPlacement = "insideBottom",
) {
  return function PeriodBBarLabels(props: {
    x?: number | string
    y?: number | string
    width?: number | string
    height?: number | string
    index?: number
  }) {
    const row = chartData[props.index ?? -1]
    if (!row) return null

    const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
    const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
    const width = typeof props.width === "number" ? props.width : Number(props.width ?? 0)
    const height = typeof props.height === "number" ? props.height : Number(props.height ?? 0)
    const centerX = x + width / 2

    if (placement === "aboveTotal") {
      const totalOffset = 10
      const changeOffset = 34

      return (
        <g>
          {row.changeDirection
            ? renderChangeLabelText(centerX, y - changeOffset, row)
            : null}
          <text
            x={centerX}
            y={y - totalOffset}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={700}
          >
            {row.periodB.toLocaleString()}
          </text>
        </g>
      )
    }

    if (!row.changeDirection) return null

    const labelY = height >= 18 ? y + height - 8 : y + height + 14

    return renderChangeLabelText(centerX, labelY, row)
  }
}

/** @deprecated Use createPeriodBBarLabels instead. */
export function createPeriodBChangeLabel(chartData: ComparativeBarRow[]) {
  return createPeriodBBarLabels(chartData, "insideBottom")
}

export function ComparativeChangeTickLabel({
  row,
  dy,
  layout = "inline",
}: {
  row: ComparativeBarRow
  dy: number
  layout?: "inline" | "stacked"
}) {
  if (!row.changeDirection) return null

  if (layout === "stacked") {
    return (
      <g>
        {renderChangeLabelText(0, dy, row, true)}
        <text
          x={0}
          y={dy + 18}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={10}
          fontWeight={700}
        >
          {row.periodB.toLocaleString()}
        </text>
      </g>
    )
  }

  const { color, text } = formatComparativeChangeLabel(row)

  return (
    <text x={0} y={0} dy={dy} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}>
      {text}
    </text>
  )
}
