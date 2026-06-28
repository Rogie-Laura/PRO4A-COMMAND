"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { ArrowDownRight, ArrowUpRight, CalendarRange, Minus, RefreshCw } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, XAxis, YAxis } from "recharts"

import { compareCrimePeriodsAction } from "@/app/(dashboard)/ridmd/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildPresetRanges,
  COMPARATIVE_PRESETS,
  getCrimeDataBounds,
  type ComparativePresetId,
  type CrimeComparativeResult,
  type CrimePeriodRange,
} from "@/lib/crime-comparative"
import { formatCrimeDateRangeLabel, isValidIsoDateRange } from "@/lib/crime-dates"
import { buildCrimePpoBreakdownItems } from "@/lib/crime-ppo-config"
import type { CrimeMonthlyCount } from "@/lib/crime-types"
import { cn } from "@/lib/utils"

type CrimeComparativePanelProps = {
  dataReady: boolean
  monthlyBreakdown: CrimeMonthlyCount[]
  coveredPeriodStart: string | null
  coveredPeriodEnd: string | null
}

const chartConfig = {
  periodA: { label: "Previous period", color: "hsl(33 95% 72%)" },
  periodB: { label: "Period in review", color: "hsl(205 85% 72%)" },
}

type PpoChartRow = {
  label: string
  periodA: number
  periodB: number
  changePct: number | null
  changeDirection: "up" | "down" | "flat" | null
}

function PeriodBBarChangeLabel(props: {
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  index?: number
  chartData: PpoChartRow[]
}) {
  const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0)
  const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0)
  const width = typeof props.width === "number" ? props.width : Number(props.width ?? 0)
  const height = typeof props.height === "number" ? props.height : Number(props.height ?? 0)
  const row = props.chartData[props.index ?? -1]

  if (!row || row.periodB <= 0 || height < 24) return null

  const color =
    row.changeDirection === "up"
      ? "#dc2626"
      : row.changeDirection === "down"
        ? "#059669"
        : "#737373"

  const arrow =
    row.changeDirection === "up" ? "↑" : row.changeDirection === "down" ? "↓" : "—"
  const label =
    row.changePct != null ? `${arrow} ${Math.abs(row.changePct)}%` : row.changeDirection ? arrow : null

  if (!label) return null

  return (
    <text
      x={x + width / 2}
      y={y + height - 6}
      textAnchor="middle"
      fill={color}
      fontSize={10}
      fontWeight={700}
    >
      {label}
    </text>
  )
}

function PeriodFields({
  title,
  accentClassName,
  range,
  onChange,
  minDate,
  maxDate,
  disabled,
}: {
  title: string
  accentClassName: string
  range: CrimePeriodRange
  onChange: (next: CrimePeriodRange) => void
  minDate?: string
  maxDate?: string
  disabled?: boolean
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", accentClassName)}>
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{range.label}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs">
          <span className="font-medium text-muted-foreground">Start date</span>
          <Input
            type="date"
            value={range.start}
            min={minDate}
            max={maxDate}
            disabled={disabled}
            onChange={(event) => {
              const start = event.target.value
              onChange({
                ...range,
                start,
                label: formatCrimeDateRangeLabel(start, range.end),
              })
            }}
          />
        </label>
        <label className="grid gap-1.5 text-xs">
          <span className="font-medium text-muted-foreground">End date</span>
          <Input
            type="date"
            value={range.end}
            min={minDate}
            max={maxDate}
            disabled={disabled}
            onChange={(event) => {
              const end = event.target.value
              onChange({
                ...range,
                end,
                label: formatCrimeDateRangeLabel(range.start, end),
              })
            }}
          />
        </label>
      </CardContent>
    </Card>
  )
}

function ChangeBadge({ result }: { result: CrimeComparativeResult }) {
  const colorClass =
    result.direction === "up"
      ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
      : result.direction === "down"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : "border-border bg-muted/40 text-muted-foreground"

  const Icon =
    result.direction === "up"
      ? ArrowUpRight
      : result.direction === "down"
        ? ArrowDownRight
        : Minus

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border px-4 py-5 text-center sm:px-6",
        colorClass,
      )}
    >
      <Icon className="mb-2 size-6" />
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">Index crime change</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
        {result.changePct != null ? `${Math.abs(result.changePct)}%` : "—"}
      </p>
      <p className="mt-1 text-xs opacity-90">
        {result.direction === "up"
          ? "Mas mataas ang period in review"
          : result.direction === "down"
            ? "Mas mababa ang period in review"
            : "Parehong level"}
        {" · "}
        {result.change >= 0 ? "+" : ""}
        {result.change.toLocaleString()} incidents
      </p>
    </div>
  )
}

export function CrimeComparativePanel({
  dataReady,
  monthlyBreakdown,
  coveredPeriodStart,
  coveredPeriodEnd,
}: CrimeComparativePanelProps) {
  const bounds = useMemo(
    () =>
      getCrimeDataBounds({
        monthlyBreakdown,
        coveredPeriodStart,
        coveredPeriodEnd,
      }),
    [monthlyBreakdown, coveredPeriodStart, coveredPeriodEnd],
  )
  const defaultPreset: ComparativePresetId = "month-vs-last-month"
  const initialRanges = useMemo(
    () => buildPresetRanges(defaultPreset, bounds),
    [bounds],
  )

  const [presetId, setPresetId] = useState<ComparativePresetId>(defaultPreset)
  const [periodA, setPeriodA] = useState<CrimePeriodRange>(initialRanges.periodA)
  const [periodB, setPeriodB] = useState<CrimePeriodRange>(initialRanges.periodB)
  const [result, setResult] = useState<CrimeComparativeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function applyPreset(nextPresetId: ComparativePresetId) {
    setPresetId(nextPresetId)
    const ranges = buildPresetRanges(nextPresetId, bounds)
    setPeriodA(ranges.periodA)
    setPeriodB(ranges.periodB)
  }

  function runCompare(nextA = periodA, nextB = periodB) {
    if (!isValidIsoDateRange(nextA.start, nextA.end) || !isValidIsoDateRange(nextB.start, nextB.end)) {
      setError("Invalid date range. Siguraduhing nasa loob ng available data ang mga petsa.")
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const comparison = await compareCrimePeriodsAction(nextA, nextB)
        setResult(comparison)
      } catch (compareError) {
        setResult(null)
        setError(
          compareError instanceof Error
            ? compareError.message
            : "Hindi makumpleto ang comparison. Subukan ulit.",
        )
      }
    })
  }

  useEffect(() => {
    if (!dataReady || !bounds) return

    const ranges = buildPresetRanges(defaultPreset, bounds)
    setPresetId(defaultPreset)
    setPeriodA(ranges.periodA)
    setPeriodB(ranges.periodB)
    runCompare(ranges.periodA, ranges.periodB)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, bounds])

  const ppoChartData = useMemo(() => {
    if (!result) return []

    const normalizePpoName = (name: string) => name.trim().toUpperCase()
    const countsA = new Map(
      result.periodA.ppoBreakdown.map((item) => [normalizePpoName(item.name), item.count]),
    )
    const countsB = new Map(
      result.periodB.ppoBreakdown.map((item) => [normalizePpoName(item.name), item.count]),
    )

    const mergedBreakdown = [...new Set([...countsA.keys(), ...countsB.keys()])].map((name) => ({
      name,
      count: countsA.get(name) ?? 0,
      percentage: 0,
    }))

    return buildCrimePpoBreakdownItems(mergedBreakdown, result.periodB.totalVolume).map((office) => {
      const periodA = countsA.get(normalizePpoName(office.csvName)) ?? 0
      const periodB = countsB.get(normalizePpoName(office.csvName)) ?? 0
      let changePct: number | null = null
      let changeDirection: PpoChartRow["changeDirection"] = null

      if (periodA > 0) {
        changePct = Math.round(((periodB - periodA) / periodA) * 1000) / 10
        if (changePct > 0) changeDirection = "up"
        else if (changePct < 0) changeDirection = "down"
        else changeDirection = "flat"
      } else if (periodB > 0) {
        changeDirection = "up"
      }

      return {
        label: office.label,
        periodA,
        periodB,
        changePct,
        changeDirection,
      }
    })
  }, [result])

  if (!dataReady) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/15">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Mag-upload muna ng crime stats sa Settings para magamit ang comparative date ranges.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarRange className="size-4 text-primary" />
                Comparative Date Range
              </CardTitle>
              <CardDescription>
                Pili ng preset o custom range · index crime lang · based on date committed (or
                reported)
                {bounds ? (
                  <>
                    {" · "}
                    Latest data as of <span className="font-medium text-foreground">{bounds.asOfLabel}</span>
                  </>
                ) : null}
              </CardDescription>
            </div>
            <Button type="button" onClick={() => runCompare()} disabled={isPending} className="shrink-0">
              <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
              Compare periods
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COMPARATIVE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  applyPreset(preset.id)
                  if (preset.id !== "custom") {
                    const ranges = buildPresetRanges(preset.id, bounds)
                    runCompare(ranges.periodA, ranges.periodB)
                  }
                }}
                className={cn(
                  "min-w-[180px] shrink-0 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  presetId === preset.id
                    ? "border-primary/40 bg-primary/10 shadow-sm"
                    : "border-border bg-muted/20 hover:border-primary/25 hover:bg-muted/40",
                )}
              >
                <p className="text-sm font-medium">{preset.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{preset.description}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PeriodFields
              title="Period A · Previous period"
              accentClassName="border-orange-500/20 bg-orange-500/5"
              range={periodA}
              onChange={(next) => {
                setPresetId("custom")
                setPeriodA(next)
              }}
              minDate={bounds?.min}
              maxDate={bounds?.max}
              disabled={isPending}
            />
            <PeriodFields
              title="Period B · Period in review"
              accentClassName="border-sky-500/20 bg-sky-500/5"
              range={periodB}
              onChange={(next) => {
                setPresetId("custom")
                setPeriodB(next)
              }}
              minDate={bounds?.min}
              maxDate={bounds?.max}
              disabled={isPending}
            />
          </div>

          {bounds ? (
            <p className="text-xs text-muted-foreground">
              Available data: {bounds.min} to {bounds.max} (as of {bounds.asOfLabel})
            </p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {isPending && !result ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl lg:w-52" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : null}

      {result ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <Card className="gap-0 overflow-hidden border-orange-500/20 bg-orange-500/5 py-0">
              <CardHeader className="border-b border-border/40 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">Period A</CardTitle>
                  <Badge variant="outline" className="border-orange-500/30 text-orange-700 dark:text-orange-300">
                    Previous period
                  </Badge>
                </div>
                <CardDescription className="text-xs">{result.periodA.label}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-3xl font-bold tabular-nums text-orange-700 dark:text-orange-300">
                  {result.periodA.totalVolume.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">index crimes</p>
              </CardContent>
            </Card>

            <ChangeBadge result={result} />

            <Card className="gap-0 overflow-hidden border-sky-500/20 bg-sky-500/5 py-0">
              <CardHeader className="border-b border-border/40 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">Period B</CardTitle>
                  <Badge variant="outline" className="border-sky-500/30 text-sky-700 dark:text-sky-300">
                    Period in review
                  </Badge>
                </div>
                <CardDescription className="text-xs">{result.periodB.label}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-3xl font-bold tabular-nums text-sky-700 dark:text-sky-300">
                  {result.periodB.totalVolume.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">index crimes</p>
              </CardContent>
            </Card>
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Index Crime by PPO</CardTitle>
              <CardDescription>
                <span className="text-orange-600 dark:text-orange-400">Light orange = Previous period (A)</span>
                {" · "}
                <span className="text-sky-600 dark:text-sky-400">Light blue = Period in review (B)</span>
                {" · "}
                <span className="text-emerald-600 dark:text-emerald-400">green ↓ bumaba</span>
                {" · "}
                <span className="text-red-600 dark:text-red-400">red ↑ tumaas</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {ppoChartData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Walang PPO breakdown sa napiling date ranges.
                </p>
              ) : (
                <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
                  <BarChart data={ppoChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tick={{ fontSize: 11 }}
                      height={56}
                    />
                    <YAxis tickLine={false} axisLine={false} width={44} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="periodA"
                      name="Previous period"
                      fill="var(--color-periodA)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="periodB"
                      name="Period in review"
                      fill="var(--color-periodB)"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="periodB"
                        content={(props) => <PeriodBBarChangeLabel {...props} chartData={ppoChartData} />}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
