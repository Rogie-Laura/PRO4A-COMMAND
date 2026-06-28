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

function renderStackedChangeLabel(
  centerX: number,
  topY: number,
  row: ComparativeBarRow,
  compact?: boolean,
) {
  if (!row.changeDirection) return null

  const { color, arrow, changeCount, pct } = getComparativeChangeParts(row)
  const countSize = compact ? 11 : 12
  const pctSize = compact ? 10 : 11
  const lineGap = compact ? 13 : 14

  return (
    <text x={centerX} y={topY} textAnchor="middle" fill={color}>
      <tspan x={centerX} dy={0} fontSize={countSize} fontWeight={800}>
        {arrow} {changeCount}
      </tspan>
      {pct ? (
        <tspan x={centerX} dy={lineGap} fontSize={pctSize} fontWeight={700}>
          {pct}
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
    if (!row || !row.changeDirection) return null

    const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
    const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
    const width = typeof props.width === "number" ? props.width : Number(props.width ?? 0)
    const height = typeof props.height === "number" ? props.height : Number(props.height ?? 0)
    const centerX = x + width / 2

    // Zero-height bars are rendered on the axis tick instead.
    if (row.periodB === 0) return null

    if (placement === "aboveTotal") {
      const totalOffset = 8
      const changeTopOffset = row.changePct != null || row.changeDirection === "flat" ? 40 : 24

      return (
        <g>
          {renderStackedChangeLabel(centerX, y - changeTopOffset, row)}
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

    const stackedHeight = row.changePct != null || row.changeDirection === "flat" ? 28 : 16
    const insideY =
      height >= stackedHeight + 8
        ? y + height - stackedHeight
        : y + height + (row.changePct != null || row.changeDirection === "flat" ? 18 : 12)

    return renderStackedChangeLabel(centerX, insideY, row, height < 40)
  }
}

/** @deprecated Use createPeriodBBarLabels instead. */
export function createPeriodBChangeLabel(chartData: ComparativeBarRow[]) {
  return createPeriodBBarLabels(chartData, "insideBottom")
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
  if (!row.changeDirection) return null

  if (layout === "stacked") {
    const pctLineCount = row.changePct != null || row.changeDirection === "flat" ? 1 : 0
    const totalY = dy + 16 + pctLineCount * 14

    return (
      <g>
        {renderStackedChangeLabel(0, dy, row, true)}
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

  return renderStackedChangeLabel(0, dy, row, true)
}
