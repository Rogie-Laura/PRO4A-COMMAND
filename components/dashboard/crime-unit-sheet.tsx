"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { CrimePpoBreakdownItem } from "@/lib/crime-ppo-config"

export type CrimeStationBreakdownItem = {
  station: string
  count: number
}

type CrimeUnitSheetProps = {
  office: (CrimePpoBreakdownItem & { stations: CrimeStationBreakdownItem[] }) | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const chartConfig = {
  count: { label: "Index crimes", color: "hsl(346 77% 50%)" },
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

function estimateLabelWidth(stations: CrimeStationBreakdownItem[], compact: boolean) {
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
  payload?: Array<{ payload: CrimeStationBreakdownItem }>
}) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{item.station}</p>
      <div className="flex justify-between gap-4 text-muted-foreground">
        <span>Index crimes</span>
        <span className="font-mono font-medium text-foreground tabular-nums">
          {item.count.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export function CrimeUnitSheet({ office, open, onOpenChange }: CrimeUnitSheetProps) {
  const isMobile = useIsMobile()
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setChartReady(false)
      return
    }

    const frame = window.requestAnimationFrame(() => setChartReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open, office?.csvName])

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

  const total = useMemo(
    () => office?.stations.reduce((sum, item) => sum + item.count, 0) ?? 0,
    [office],
  )

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
                    {office.stations.length} units · {total.toLocaleString()} index crimes
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="pb-8 pl-0 pr-4">
              {office.stations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Walang index crime data para sa office na ito.
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
                        dataKey="count"
                        fill="var(--color-count)"
                        radius={[0, 4, 4, 0]}
                        barSize={isMobile ? 18 : 22}
                      >
                        <LabelList
                          dataKey="count"
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
