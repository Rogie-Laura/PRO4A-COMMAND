"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { OfficeBreakdownItem, StationBreakdownItem } from "@/lib/personnel-types"

type OfficeStationSheetProps = {
  office: OfficeBreakdownItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const chartConfig = {
  uniformed: { label: "Uniformed Personnel", color: "var(--chart-1)" },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(media.matches)

    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return isMobile
}

function estimateLabelWidth(stations: StationBreakdownItem[], compact: boolean) {
  const longest = stations.reduce(
    (max, station) => Math.max(max, station.station.length),
    0,
  )

  if (compact) {
    return Math.min(128, Math.max(96, longest * 5.5 + 20))
  }

  return Math.min(400, Math.max(220, longest * 7.5 + 32))
}

function truncateStationLabel(label: string, compact: boolean) {
  if (!compact) return label
  return label.length > 14 ? `${label.slice(0, 14)}…` : label
}

function StationAxisTick({
  compact,
  ...props
}: {
  compact: boolean
  x?: string | number
  y?: string | number
  payload?: { value: string }
}) {
  const y = typeof props.y === "number" ? props.y : Number(props.y)
  if (!Number.isFinite(y) || !props.payload) return null

  const label = truncateStationLabel(props.payload.value, compact)

  return (
    <text
      x={8}
      y={y}
      dy={4}
      textAnchor="start"
      className="fill-muted-foreground text-[11px] sm:text-[12px]"
    >
      <title>{props.payload.value}</title>
      {label}
    </text>
  )
}

function StationTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: StationBreakdownItem }>
}) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{item.station}</p>
      <div className="grid gap-1 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <span>PCO</span>
          <span className="font-mono font-medium text-foreground tabular-nums">
            {item.pco.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>PNCO</span>
          <span className="font-mono font-medium text-foreground tabular-nums">
            {item.pnco.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>NUP</span>
          <span className="font-mono font-medium text-foreground tabular-nums">
            {item.nup.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export function OfficeStationSheet({ office, open, onOpenChange }: OfficeStationSheetProps) {
  const isMobile = useIsMobile()
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setChartReady(false)
      return
    }

    const frame = window.requestAnimationFrame(() => setChartReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open, office?.subUnit])

  const chartHeight = useMemo(() => {
    if (!office) return 400
    return Math.max(400, office.stations.length * 44 + 72)
  }, [office])

  const labelWidth = useMemo(() => {
    if (!office) return isMobile ? 112 : 220
    return estimateLabelWidth(office.stations, isMobile)
  }, [office, isMobile])

  const chartMinWidth = useMemo(() => {
    if (!isMobile) return undefined
    return labelWidth + 220
  }, [isMobile, labelWidth])

  const totals = useMemo(() => {
    if (!office) return { pco: 0, pnco: 0, nup: 0, uniformed: 0 }
    return office.stations.reduce(
      (acc, item) => ({
        pco: acc.pco + item.pco,
        pnco: acc.pnco + item.pnco,
        nup: acc.nup + item.nup,
        uniformed: acc.uniformed + item.uniformed,
      }),
      { pco: 0, pnco: 0, nup: 0, uniformed: 0 },
    )
  }, [office])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full !w-full max-w-none overflow-y-auto sm:!w-[98vw]"
      >
        {office && (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center gap-3 pr-8">
                <OfficeLogo
                  src={office.logo}
                  alt={office.label}
                  fallback={office.shortLabel}
                  colorClass={office.colorClass}
                />
                <div className="min-w-0">
                  <SheetTitle className="text-lg">{office.label}</SheetTitle>
                  <SheetDescription>
                    {office.stations.length} sub-units · {totals.uniformed.toLocaleString()} uniformed
                    · {totals.nup.toLocaleString()} NUP
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="pb-8 pl-0 pr-4">
              {office.stations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Walang station data para sa office na ito.
                </p>
              ) : chartReady ? (
                <div className="mt-2 w-full overflow-x-auto">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-auto w-full min-h-[280px]"
                    style={{ height: chartHeight, minWidth: chartMinWidth }}
                    initialDimension={{ width: isMobile ? 360 : 640, height: chartHeight }}
                  >
                    <BarChart
                      data={office.stations}
                      layout="vertical"
                      margin={{
                        top: 8,
                        right: isMobile ? 40 : 56,
                        left: 4,
                        bottom: 8,
                      }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={isMobile ? 11 : 13}
                      />
                      <YAxis
                        type="category"
                        dataKey="station"
                        tickLine={false}
                        axisLine={false}
                        width={labelWidth}
                        interval={0}
                        tick={(props) => <StationAxisTick {...props} compact={isMobile} />}
                      />
                      <ChartTooltip
                      content={<StationTooltip />}
                      cursor={{ fill: "color-mix(in oklch, var(--muted) 45%, transparent)" }}
                    />
                      <Bar
                        dataKey="uniformed"
                        fill="var(--color-uniformed)"
                        radius={[0, 4, 4, 0]}
                        barSize={isMobile ? 18 : 22}
                      >
                        <LabelList
                          dataKey="uniformed"
                          position="right"
                          className="fill-foreground text-[10px] font-semibold tabular-nums sm:text-xs"
                          formatter={(value) =>
                            typeof value === "number" ? value.toLocaleString() : String(value)
                          }
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="mt-2 h-[280px] w-full animate-pulse rounded-lg bg-muted/40" />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
