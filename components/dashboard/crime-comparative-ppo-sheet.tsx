"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, XAxis, YAxis } from "recharts"

import { comparePpoCrimeTypesAction } from "@/app/(dashboard)/ridmd/actions"
import {
  ComparativeBarTotalLabel,
  comparativeBarChartConfig,
  createPeriodBChangeLabel,
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

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="currentColor" fontSize={10}>
        <title>{row.label}</title>
        {text}
      </text>
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
  const profileCacheRef = useRef(new Map<string, ComparativeBarRow[]>())

  useEffect(() => {
    if (!open || !office) {
      setRows([])
      setError(null)
      return
    }

    const cacheKey = `${office.csvName}|${periodA.start}|${periodA.end}|${periodB.start}|${periodB.end}`
    const cachedRows = profileCacheRef.current.get(cacheKey)
    if (cachedRows) {
      setRows(cachedRows)
      setError(null)
      return
    }

    startTransition(async () => {
      try {
        const result = await comparePpoCrimeTypesAction(office.csvName, periodA, periodB)
        const nextRows = result.map((row) => ({
          label: row.crime,
          periodA: row.periodA,
          periodB: row.periodB,
          change: row.change,
          changePct: row.changePct,
          changeDirection: row.changeDirection,
        }))
        profileCacheRef.current.set(cacheKey, nextRows)
        setRows(nextRows)
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

  const periodBChangeLabel = useMemo(() => createPeriodBChangeLabel(rows), [rows])

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
                <Skeleton className="h-[400px] w-full rounded-lg" />
              ) : error ? (
                <p className="py-8 text-center text-sm text-destructive">{error}</p>
              ) : (
                <div className="w-full overflow-x-auto overscroll-x-contain">
                  <ChartContainer
                    config={comparativeBarChartConfig}
                    className="aspect-auto h-[400px] sm:h-[460px]"
                    style={{
                      minWidth: chartMinWidth ?? "100%",
                      width: chartMinWidth ?? "100%",
                    }}
                    initialDimension={{
                      width: chartMinWidth ?? (isMobile ? 360 : 720),
                      height: isMobile ? 400 : 460,
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
                        <LabelList dataKey="periodB" content={periodBChangeLabel} />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
