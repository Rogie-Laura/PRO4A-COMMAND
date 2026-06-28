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

const PERIOD_B_LABEL = {
  totalAboveBar: 8,
  pctAboveTotal: 16,
  countAbovePct: 15,
  countAboveTotalNoPct: 18,
} as const

export function getComparativeChangeParts(row: ComparativeBarRow) {
  const color =
    row.changeDirection === "up"
      ? "#dc2626"
      : row.changeDirection === "down"
        ? "#059669"
        : "#737373"

  const arrow =
    row.changeDirection === "up" ? "↑" : row.changeDirection === "down" ? "↓" : "—"
  const changeCount = Math.abs(row.change).toLocaleString()
  const pct =
    row.changePct != null
      ? `${Math.abs(row.changePct)}%`
      : row.changeDirection === "flat"
        ? "0%"
        : null

  return { color, arrow, changeCount, pct }
}

export function formatComparativeChangeLabel(row: ComparativeBarRow) {
  const { color, arrow, changeCount, pct } = getComparativeChangeParts(row)
  const pctPart = pct ? ` · ${pct}` : ""

  return { color, text: `${arrow} ${changeCount}${pctPart}` }
}

export function getPeriodBLabelStackHeight(row: ComparativeBarRow) {
  if (!row.changeDirection) return 20

  const hasPct = row.changePct != null || row.changeDirection === "flat"
  return hasPct ? 56 : 38
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

function renderPeriodBReviewLabelStack(
  centerX: number,
  barTopY: number,
  row: ComparativeBarRow,
  compact?: boolean,
) {
  const totalY = barTopY - PERIOD_B_LABEL.totalAboveBar
  const countSize = compact ? 11 : 12
  const pctSize = compact ? 10 : 11
  const totalSize = compact ? 10 : 11

  const totalLabel = (
    <text
      x={centerX}
      y={totalY}
      textAnchor="middle"
      className="fill-foreground"
      fontSize={totalSize}
      fontWeight={700}
    >
      {row.periodB.toLocaleString()}
    </text>
  )

  if (!row.changeDirection) {
    return totalLabel
  }

  const { color, arrow, changeCount, pct } = getComparativeChangeParts(row)
  const countY = pct
    ? totalY - PERIOD_B_LABEL.pctAboveTotal - PERIOD_B_LABEL.countAbovePct
    : totalY - PERIOD_B_LABEL.countAboveTotalNoPct
  const pctY = totalY - PERIOD_B_LABEL.pctAboveTotal

  return (
    <g>
      <text
        x={centerX}
        y={countY}
        textAnchor="middle"
        fill={color}
        fontSize={countSize}
        fontWeight={800}
      >
        {arrow} {changeCount}
      </text>
      {pct ? (
        <text
          x={centerX}
          y={pctY}
          textAnchor="middle"
          fill={color}
          fontSize={pctSize}
          fontWeight={700}
        >
          {pct}
        </text>
      ) : null}
      {totalLabel}
    </g>
  )
}

export type PeriodBLabelPlacement = "insideBottom" | "aboveTotal"

export function createPeriodBBarLabels(
  chartData: ComparativeBarRow[],
  placement: PeriodBLabelPlacement = "aboveTotal",
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
    const centerX = x + width / 2

    if (placement === "aboveTotal") {
      return renderPeriodBReviewLabelStack(centerX, y, row)
    }

    // Zero-height bars fall back to the axis tick on the main PPO chart.
    if (row.periodB === 0) return null

    if (!row.changeDirection) return null

    const height = typeof props.height === "number" ? props.height : Number(props.height ?? 0)
    const stackHeight = getPeriodBLabelStackHeight(row)
    const barTopY =
      height >= stackHeight + 10 ? y + height - stackHeight : y + height + stackHeight - 10

    return renderPeriodBReviewLabelStack(centerX, barTopY, row, height < 48)
  }
}

/** @deprecated Use createPeriodBBarLabels instead. */
export function createPeriodBChangeLabel(chartData: ComparativeBarRow[]) {
  return createPeriodBBarLabels(chartData, "aboveTotal")
}

export function ComparativeChangeTickLabel({
  row,
  dy,
  layout = "stacked",
}: {
  row: ComparativeBarRow
  dy: number
  layout?: "inline" | "stacked"
}) {
  if (!row.changeDirection) {
    return (
      <text
        x={0}
        y={dy + 24}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={700}
      >
        {row.periodB.toLocaleString()}
      </text>
    )
  }

  const { color, arrow, changeCount, pct } = getComparativeChangeParts(row)
  const countY = dy
  const pctY = dy + 15
  const totalY = pct ? dy + 31 : dy + 18

  if (layout === "stacked") {
    return (
      <g>
        <text x={0} y={countY} textAnchor="middle" fill={color} fontSize={11} fontWeight={800}>
          {arrow} {changeCount}
        </text>
        {pct ? (
          <text x={0} y={pctY} textAnchor="middle" fill={color} fontSize={10} fontWeight={700}>
            {pct}
          </text>
        ) : null}
        <text
          x={0}
          y={totalY}
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

  return (
    <text x={0} y={countY} textAnchor="middle" fill={color} fontSize={11} fontWeight={800}>
      {arrow} {changeCount}
    </text>
  )
}
