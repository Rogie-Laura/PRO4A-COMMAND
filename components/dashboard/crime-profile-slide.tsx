"use client"

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, XAxis, YAxis } from "recharts"

import { fetchCrimeFocusProfileAction } from "@/app/(dashboard)/ridmd/actions"
import {
  ComparativeBarTotalLabel,
  comparativeBarChartConfig,
  createPeriodBChangeLabel,
} from "@/components/dashboard/crime-comparative-chart-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { buildCountChangeMetrics, type CrimePeriodRange } from "@/lib/crime-comparative"
import { INDEX_FOCUS_CRIME_ORDER } from "@/lib/crime-config"
import { buildCrimePpoBreakdownItems } from "@/lib/crime-ppo-config"
import type { CrimeFocusProfileData } from "@/lib/crime-profile"
import { cn } from "@/lib/utils"

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

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
      <div className="shrink-0 border-b bg-muted/25 px-2 py-1.5">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]">{title}</p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden p-1 sm:p-1.5">{children}</div>
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

  const ppoPieData = useMemo(
    () =>
      buildCrimePpoBreakdownItems(profile.ppoDistribution, profile.comparison.periodB)
        .filter((item) => item.count > 0)
        .map((item) => ({
          name: item.shortLabel,
          fullName: item.label,
          count: item.count,
          percentage: item.percentage,
        })),
    [profile.ppoDistribution, profile.comparison.periodB],
  )

  const caseStatusData = profile.caseStatusBreakdown

  const ppoChartConfig = useMemo(
    () =>
      Object.fromEntries(
        ppoPieData.map((item, index) => [
          item.name,
          { label: item.fullName, color: PIE_COLORS[index % PIE_COLORS.length] },
        ]),
      ),
    [ppoPieData],
  )

  return (
    <div className="grid h-full min-h-0 grid-cols-6 grid-rows-6 gap-1 sm:gap-1.5">
      <FrameSection title="Previous vs Review" className="col-span-2 row-span-6">
        {comparisonRows.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <ChartContainer config={comparativeBarChartConfig} className="h-full min-h-0 w-full">
            <BarChart
              data={comparisonRows}
              margin={{ top: isMobile ? 48 : 56, right: 4, left: 0, bottom: 0 }}
              barCategoryGap="30%"
              barGap={6}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis tickLine={false} axisLine={false} width={28} fontSize={10} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar
                dataKey="periodA"
                name="Previous"
                fill="var(--color-periodA)"
                radius={[3, 3, 0, 0]}
                maxBarSize={isMobile ? 36 : 44}
              >
                <LabelList dataKey="periodA" content={<ComparativeBarTotalLabel />} />
              </Bar>
              <Bar
                dataKey="periodB"
                name="In review"
                fill="var(--color-periodB)"
                radius={[3, 3, 0, 0]}
                maxBarSize={isMobile ? 36 : 44}
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
            className="h-full min-h-0 w-full"
          >
            <BarChart
              data={typeofPlaceData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} fontSize={9} />
              <YAxis
                type="category"
                dataKey="shortLabel"
                tickLine={false}
                axisLine={false}
                width={isMobile ? 68 : 88}
                fontSize={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => String(payload?.[0]?.payload?.label ?? "")}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 3, 3, 0]} maxBarSize={12}>
                <LabelList dataKey="count" position="right" fontSize={8} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>

      <FrameSection title="PPO Distribution" className="col-span-2 row-span-3">
        {ppoPieData.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <ChartContainer config={ppoChartConfig} className="h-full min-h-0 w-full">
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
                data={ppoPieData}
                dataKey="count"
                nameKey="name"
                innerRadius="42%"
                outerRadius="78%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {ppoPieData.map((item, index) => (
                  <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </FrameSection>

      <FrameSection title="Case Status" className="col-span-2 row-span-3">
        {caseStatusData.length === 0 ? (
          <EmptyChartNote />
        ) : (
          <ChartContainer
            config={{ count: { label: "Incidents", color: "var(--chart-3)" } }}
            className="h-full min-h-0 w-full"
          >
            <BarChart data={caseStatusData} margin={{ top: 8, right: 2, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                fontSize={8}
                tickFormatter={(value) => truncateLabel(String(value), isMobile ? 8 : 10)}
              />
              <YAxis tickLine={false} axisLine={false} width={24} allowDecimals={false} fontSize={9} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={isMobile ? 28 : 36}>
                {caseStatusData.map((item, index) => (
                  <Cell key={item.name} fill={CASE_STATUS_COLORS[index % CASE_STATUS_COLORS.length]} />
                ))}
                <LabelList dataKey="count" position="top" fontSize={8} />
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
  "h-[calc(100dvh-3.5rem)] snap-start snap-always flex flex-col px-0 py-2 sm:py-3"

function CrimeProfileFullPage({
  focusCrime,
  pageNumber,
  totalPages,
  periodA,
  periodB,
  isMobile,
}: {
  focusCrime: string
  pageNumber: number
  totalPages: number
  periodA: CrimePeriodRange
  periodB: CrimePeriodRange
  isMobile: boolean
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [profile, setProfile] = useState<CrimeFocusProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
        }
      },
      { rootMargin: "240px 0px" },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

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
    <section ref={sectionRef} className={CRIME_PROFILE_PAGE_CLASS} aria-label={`Crime profile ${focusCrime}`}>
      <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0">
        <CardHeader className="shrink-0 border-b px-3 py-2 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="truncate text-sm font-bold uppercase tracking-wide sm:text-base">
              Crime Profile — {focusCrime}
            </CardTitle>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground sm:text-xs">
              {pageNumber} / {totalPages}
            </span>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-hidden p-2 sm:p-3">
          {isPending && !profile ? (
            <Skeleton className="h-full rounded-md" />
          ) : error ? (
            <p className="flex h-full items-center justify-center text-sm text-destructive">{error}</p>
          ) : profile ? (
            <CrimeProfileFrame profile={profile} isMobile={isMobile} />
          ) : (
            <Skeleton className="h-full rounded-md" />
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export function CrimeProfilePages({ periodA, periodB, isMobile }: CrimeProfilePagesProps) {
  useEffect(() => {
    const main = document.querySelector("main")
    if (!main) return

    main.classList.add("snap-y", "snap-mandatory", "scroll-smooth")
    return () => {
      main.classList.remove("snap-y", "snap-mandatory", "scroll-smooth")
    }
  }, [])

  return (
    <div className="space-y-0">
      {INDEX_FOCUS_CRIME_ORDER.map((crime, index) => (
        <CrimeProfileFullPage
          key={crime}
          focusCrime={crime}
          pageNumber={index + 1}
          totalPages={INDEX_FOCUS_CRIME_ORDER.length}
          periodA={periodA}
          periodB={periodB}
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}
