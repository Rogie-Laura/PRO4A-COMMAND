"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, XAxis, YAxis } from "recharts"

import { comparePpoCrimeTypesAction } from "@/app/(dashboard)/ridmd/actions"
import {
  ComparativeBarTotalLabel,
  ComparativeChangeTickLabel,
  comparativeBarChartConfig,
  createPeriodBBarLabels,
  type ComparativeBarRow,
} from "@/components/dashboard/crime-comparative-chart-utils"
import { OfficeLogo } from "@/components/dashboard/office-logo"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CrimePeriodRange } from "@/lib/crime-comparative"
import { buildComparativePeriodNarrative } from "@/lib/crime-comparative"
import type { CrimePpoBreakdownItem } from "@/lib/crime-ppo-config"

type CrimeComparativePpoSheetProps = {
  office: CrimePpoBreakdownItem | null
  periodA: CrimePeriodRange
  periodB: CrimePeriodRange
  open: boolean
  onOpenChange: (open: boolean) => void
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

function truncateCrimeLabel(label: string, compact: boolean) {
  if (!compact) return label.length > 28 ? `${label.slice(0, 28)}…` : label
  return label.length > 16 ? `${label.slice(0, 16)}…` : label
}

function CrimeAxisTick({
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
  const changeLineOffset = 26

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="currentColor" fontSize={10}>
        <title>{row.label}</title>
        {text}
      </text>
      {row.periodB === 0 ? (
        <ComparativeChangeTickLabel row={row} dy={changeLineOffset} layout="stacked" />
      ) : null}
    </g>
  )
}

export function CrimeComparativePpoSheet({
  office,
  periodA,
  periodB,
  open,
  onOpenChange,
}: CrimeComparativePpoSheetProps) {
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<ComparativeBarRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open || !office) {
      setRows([])
      setError(null)
      return
    }

    startTransition(async () => {
      try {
        const result = await comparePpoCrimeTypesAction(office.csvName, periodA, periodB)
        setRows(
          result.map((row) => ({
            label: row.crime,
            periodA: row.periodA,
            periodB: row.periodB,
            change: row.change,
            changePct: row.changePct,
            changeDirection: row.changeDirection,
          })),
        )
        setError(null)
      } catch (loadError) {
        setRows([])
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Hindi ma-load ang focus crime profile para sa office na ito.",
        )
      }
    })
  }, [open, office, periodA, periodB])

  const chartMinWidth = useMemo(() => {
    if (!isMobile || rows.length === 0) return undefined
    return Math.max(360, rows.length * 96 + 56)
  }, [isMobile, rows.length])

  const chartHeight = useMemo(() => {
    return isMobile ? 360 : 420
  }, [isMobile])

  const periodBBarLabels = useMemo(
    () => createPeriodBBarLabels(rows, "aboveTotal"),
    [rows],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        {office ? (
          <>
            <DialogHeader className="border-b border-primary/15 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <OfficeLogo
                  src={office.logo}
                  alt={office.label}
                  fallback={office.shortLabel}
                  colorClass={office.colorClass}
                />
                <div className="min-w-0">
                  <DialogTitle>{office.label} Crime Profile</DialogTitle>
                  <DialogDescription>
                    Focus crimes · {periodA.label} vs {periodB.label}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody>
              {isPending ? (
                <Skeleton className="h-[360px] w-full rounded-lg" />
              ) : error ? (
                <p className="py-8 text-center text-sm text-destructive">{error}</p>
              ) : (
                <div className="w-full overflow-x-auto overscroll-x-contain">
                  <ChartContainer
                    config={comparativeBarChartConfig}
                    className="aspect-auto"
                    style={{
                      height: chartHeight,
                      minWidth: chartMinWidth ?? "100%",
                      width: chartMinWidth ?? "100%",
                    }}
                    initialDimension={{
                      width: chartMinWidth ?? (isMobile ? 360 : 720),
                      height: chartHeight,
                    }}
                  >
                    <BarChart
                      data={rows}
                      margin={{ top: 56, right: isMobile ? 12 : 8, left: 0, bottom: 8 }}
                      barCategoryGap={isMobile ? "24%" : "20%"}
                      barGap={isMobile ? 3 : 6}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={isMobile ? 104 : 88}
                        tick={(props) => (
                          <CrimeAxisTick {...props} chartData={rows} compact={isMobile} />
                        )}
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
                        <LabelList dataKey="periodB" content={periodBBarLabels} />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              )}

              {!isPending && rows.length > 0 ? (
                <div className="mt-4 border-t border-border/40 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Breakdown by focus crime
                  </p>
                  <div className="mt-3 space-y-2">
                    {rows.map((row) => (
                      <p key={row.label} className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
                        {buildComparativePeriodNarrative(row)}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
