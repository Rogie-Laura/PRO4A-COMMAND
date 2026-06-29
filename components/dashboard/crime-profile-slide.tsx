"use client"

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, XAxis, YAxis } from "recharts"

import { fetchCrimeFocusProfileAction } from "@/app/(dashboard)/ridmd/actions"
import {
  ComparativeBarTotalLabel,
  comparativeBarChartConfig,
  createPeriodBChangeLabel,
} from "@/components/dashboard/crime-comparative-chart-utils"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { buildCountChangeMetrics, type CrimePeriodRange } from "@/lib/crime-comparative"
import { INDEX_FOCUS_CRIME_ORDER } from "@/lib/crime-config"
import { buildCrimePpoBreakdownItems, CRIME_PPO_PIE_LABELS, getCrimePpoPieColor } from "@/lib/crime-ppo-config"
import type { CrimeFocusProfileData } from "@/lib/crime-profile"
import { cn } from "@/lib/utils"

const PROFILE_CHART_CLASS = "aspect-auto h-full min-h-0 w-full"

const CASE_STATUS_COLORS = [
  "hsl(142 71% 45%)",
  "hsl(205 85% 55%)",
  "hsl(35 92% 50%)",
  "hsl(346 77% 50%)",
  "hsl(280 65% 55%)",
]

type CrimeProfilePagesProps = {
  periodA: CrimePeriodRange
  periodB: CrimePeriodRange
  isMobile: boolean
}

function truncateLabel(value: string, max = 22) {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function FrameSection({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border bg-background/80",
        className,
      )}
    >
      <div className="shrink-0 border-b bg-muted/25 px-1.5 py-1">
        <p className="truncate text-[9px] font-semibold uppercase tracking-wide sm:text-[10px]">{title}</p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden p-0.5 sm:p-1">{children}</div>
    </div>
  )
}

function CrimeProfileFrame({
  profile,
  isMobile,
}: {
  profile: CrimeFocusProfileData
  isMobile: boolean
}) {
  const comparisonRows = useMemo(() => {
    const metrics = buildCountChangeMetrics(profile.comparison.periodA, profile.comparison.periodB)
    return [
      {
        label: profile.crime,
        periodA: profile.comparison.periodA,
        periodB: profile.comparison.periodB,
        ...metrics,
      },
    ]
  }, [profile])

  const periodBChangeLabel = useMemo(
    () => createPeriodBChangeLabel(comparisonRows),
    [comparisonRows],
  )

  const typeofPlaceData = useMemo(
    () =>
      profile.typeofPlaceBreakdown.slice(0, isMobile ? 4 : 5).map((item) => ({
        label: item.name,
        shortLabel: truncateLabel(item.name, isMobile ? 10 : 14),
        count: item.count,
      })),
    [profile.typeofPlaceBreakdown, isMobile],
  )

  const ppoPieData = useMemo(() => {
    const items = buildCrimePpoBreakdownItems(profile.ppoDistribution, profile.comparison.periodB)
    return items.map((item) => {
      const pieLabel =
        CRIME_PPO_PIE_LABELS[item.csvName as keyof typeof CRIME_PPO_PIE_LABELS] ?? item.shortLabel

      return {
        name: pieLabel,
        fullName: item.label,
        count: item.count,
        percentage: item.percentage,
        color: getCrimePpoPieColor(item.csvName),
      }
    })
  }, [profile.ppoDistribution, profile.comparison.periodB])

  const ppoPieSlices = useMemo(() => ppoPieData.filter((item) => item.count > 0), [ppoPieData])

  const caseStatusData = profile.caseStatusBreakdown

  const ppoChartConfig = useMemo(
    () =>
      Object.fromEntries(
        ppoPieData.map((item) => [
          item.name,
          {
            label: item.fullName,
            color: item.color,
          },
        ]),
      ),
    [ppoPieData],
  )

  return (
    <div className="grid h-full min-h-0 grid-cols-6 grid-rows-6 gap-0.5 sm:gap-1">
      <FrameSection title="Previous vs Review" className="col-span-2 row-span-6">
        {comparisonRows.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <ChartContainer config={comparativeBarChartConfig} className={PROFILE_CHART_CLASS}>
            <BarChart
              data={comparisonRows}
              margin={{ top: isMobile ? 32 : 40, right: 4, left: 0, bottom: 0 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={9} />
              <YAxis tickLine={false} axisLine={false} width={24} fontSize={9} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar
                dataKey="periodA"
                name="Previous"
                fill="var(--color-periodA)"
                radius={[2, 2, 0, 0]}
                maxBarSize={isMobile ? 28 : 36}
              >
                <LabelList dataKey="periodA" content={<ComparativeBarTotalLabel />} />
              </Bar>
              <Bar
                dataKey="periodB"
                name="In review"
                fill="var(--color-periodB)"
                radius={[2, 2, 0, 0]}
                maxBarSize={isMobile ? 28 : 36}
              >
                <LabelList dataKey="periodB" content={periodBChangeLabel} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>

      <FrameSection title="Type of Place" className="col-span-4 row-span-3">
        {typeofPlaceData.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <ChartContainer
            config={{ count: { label: "Incidents", color: "var(--chart-2)" } }}
            className={PROFILE_CHART_CLASS}
          >
            <BarChart
              data={typeofPlaceData}
              layout="vertical"
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} fontSize={8} />
              <YAxis
                type="category"
                dataKey="shortLabel"
                tickLine={false}
                axisLine={false}
                width={isMobile ? 60 : 76}
                fontSize={7}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => String(payload?.[0]?.payload?.label ?? "")}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 2, 2, 0]} maxBarSize={10}>
                <LabelList dataKey="count" position="right" fontSize={7} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>

      <FrameSection title="PPO Distribution" className="col-span-2 row-span-3">
        {ppoPieSlices.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1">
              <ChartContainer config={ppoChartConfig} className={PROFILE_CHART_CLASS}>
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="name"
                        formatter={(value, _name, item) => {
                          const payload = item.payload as { fullName?: string; percentage?: number }
                          return `${payload.fullName ?? item.name}: ${Number(value).toLocaleString()} (${payload.percentage ?? 0}%)`
                        }}
                      />
                    }
                  />
                  <Pie
                    data={ppoPieSlices}
                    dataKey="count"
                    nameKey="name"
                    innerRadius="34%"
                    outerRadius="68%"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {ppoPieSlices.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="shrink-0 grid grid-cols-3 gap-x-0.5 gap-y-0 border-t border-border/40 px-0.5 pt-0.5 text-[7px] leading-tight sm:text-[8px]">
              {ppoPieData.slice(0, 5).map((item) => (
                <div key={item.name} className="flex min-w-0 items-center gap-0.5">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="shrink-0 font-semibold">{item.name}</span>
                  <span className="truncate text-muted-foreground tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </FrameSection>

      <FrameSection title="Case Status" className="col-span-2 row-span-3">
        {caseStatusData.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <ChartContainer
            config={{ count: { label: "Incidents", color: "var(--chart-3)" } }}
            className={PROFILE_CHART_CLASS}
          >
            <BarChart data={caseStatusData} margin={{ top: 4, right: 2, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                fontSize={7}
                tickFormatter={(value) => truncateLabel(String(value), isMobile ? 7 : 9)}
              />
              <YAxis tickLine={false} axisLine={false} width={20} allowDecimals={false} fontSize={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={isMobile ? 22 : 28}>
                {caseStatusData.map((item, index) => (
                  <Cell key={item.name} fill={CASE_STATUS_COLORS[index % CASE_STATUS_COLORS.length]} />
                ))}
                <LabelList dataKey="count" position="top" fontSize={7} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>
    </div>
  )
}

function EmptyChartNote() {
  return (
    <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
      Walang data
    </div>
  )
}

const CRIME_PROFILE_PAGE_CLASS =
  "box-border flex h-[440px] flex-col overflow-hidden sm:h-[480px]"

function CrimeProfileFullPage({
  focusCrime,
  periodA,
  periodB,
  isMobile,
}: {
  focusCrime: string
  periodA: CrimePeriodRange
  periodB: CrimePeriodRange
  isMobile: boolean
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldLoad, setShouldLoad] = useState(focusCrime === INDEX_FOCUS_CRIME_ORDER[0])
  const [profile, setProfile] = useState<CrimeFocusProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || shouldLoad) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0.01,
      },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [shouldLoad])

  useEffect(() => {
    if (!shouldLoad) return

    startTransition(async () => {
      try {
        const result = await fetchCrimeFocusProfileAction(focusCrime, periodA, periodB)
        setProfile(result)
        setError(null)
      } catch (loadError) {
        setProfile(null)
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Hindi ma-load ang crime profile page.",
        )
      }
    })
  }, [shouldLoad, focusCrime, periodA, periodB])

  return (
    <section
      ref={sectionRef}
      className={CRIME_PROFILE_PAGE_CLASS}
      aria-label={`Crime profile ${focusCrime}`}
    >
      <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0 shadow-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-1.5 sm:p-2">
          <CardTitle className="shrink-0 border-b pb-1 text-xs font-bold uppercase tracking-wide sm:text-sm">
            Crime Profile — {focusCrime}
          </CardTitle>

          <div className="min-h-0 flex-1 overflow-hidden pt-1">
            {isPending && !profile ? (
              <Skeleton className="h-full rounded-md" />
            ) : error ? (
              <p className="flex h-full items-center justify-center text-sm text-destructive">{error}</p>
            ) : profile ? (
              <CrimeProfileFrame profile={profile} isMobile={isMobile} />
            ) : (
              <Skeleton className="h-full rounded-md" />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export function CrimeProfilePages({ periodA, periodB, isMobile }: CrimeProfilePagesProps) {
  return (
    <div className="space-y-4">
      {INDEX_FOCUS_CRIME_ORDER.map((crime) => (
        <CrimeProfileFullPage
          key={crime}
          focusCrime={crime}
          periodA={periodA}
          periodB={periodB}
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}
