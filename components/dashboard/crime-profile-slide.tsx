"use client"

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, XAxis, YAxis } from "recharts"

import { fetchCrimeFocusProfileAction } from "@/app/(dashboard)/ridmd/actions"
import {
  ComparativeBarTotalLabel,
  comparativeBarChartConfig,
  createPeriodBChangeLabel,
} from "@/components/dashboard/crime-comparative-chart-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  description,
  className,
  children,
}: {
  title: string
  description?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex min-h-[200px] min-w-0 flex-col overflow-hidden rounded-lg border bg-background/80", className)}>
      <div className="border-b bg-muted/25 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">{title}</p>
        {description ? <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-2 sm:p-3">{children}</div>
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
      profile.typeofPlaceBreakdown.slice(0, isMobile ? 5 : 7).map((item) => ({
        label: item.name,
        shortLabel: truncateLabel(item.name, isMobile ? 12 : 16),
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
    <div className="grid min-h-[520px] grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-5 lg:grid-rows-2 lg:gap-3">
      <FrameSection
        title="Previous vs Period in Review"
        description={profile.crime}
        className="lg:col-span-2 lg:row-span-2 lg:min-h-[480px]"
      >
        {comparisonRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Walang data.</p>
        ) : (
          <ChartContainer
            config={comparativeBarChartConfig}
            className="aspect-auto h-[240px] w-full lg:h-full lg:min-h-[300px]"
          >
            <BarChart
              data={comparisonRows}
              margin={{ top: 64, right: 8, left: 0, bottom: 8 }}
              barCategoryGap="28%"
              barGap={8}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="periodA"
                name="Previous period"
                fill="var(--color-periodA)"
                radius={[4, 4, 0, 0]}
                maxBarSize={52}
              >
                <LabelList dataKey="periodA" content={<ComparativeBarTotalLabel />} />
              </Bar>
              <Bar
                dataKey="periodB"
                name="Period in review"
                fill="var(--color-periodB)"
                radius={[4, 4, 0, 0]}
                maxBarSize={52}
              >
                <LabelList dataKey="periodB" content={periodBChangeLabel} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>

      <FrameSection
        title="Type of Place"
        description={`Period in review · ${profile.periodBLabel}`}
        className="lg:col-span-3"
      >
        {typeofPlaceData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Walang data.</p>
        ) : (
          <ChartContainer
            config={{ count: { label: "Incidents", color: "var(--chart-2)" } }}
            className="aspect-auto h-[200px] w-full lg:h-[220px]"
          >
            <BarChart
              data={typeofPlaceData}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} fontSize={10} />
              <YAxis
                type="category"
                dataKey="shortLabel"
                tickLine={false}
                axisLine={false}
                width={isMobile ? 84 : 108}
                fontSize={9}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => String(payload?.[0]?.payload?.label ?? "")}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} maxBarSize={16}>
                <LabelList dataKey="count" position="right" fontSize={9} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>

      <FrameSection
        title="PPO Distribution"
        description={`Period in review · ${profile.periodBLabel}`}
        className="lg:col-span-1"
      >
        {ppoPieData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Walang data.</p>
        ) : (
          <div className="grid w-full gap-2">
            <ChartContainer
              config={ppoChartConfig}
              className="mx-auto aspect-square h-[150px] w-full max-w-[180px] lg:h-[160px]"
            >
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
                  innerRadius={36}
                  outerRadius={68}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {ppoPieData.map((item, index) => (
                    <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-1">
              {ppoPieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-1 text-[10px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="truncate">{item.fullName}</span>
                  </div>
                  <span className="shrink-0 tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </FrameSection>

      <FrameSection
        title="Case Status"
        description={`Period in review · ${profile.periodBLabel}`}
        className="lg:col-span-2"
      >
        {caseStatusData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Walang data.</p>
        ) : (
          <ChartContainer
            config={{ count: { label: "Incidents", color: "var(--chart-3)" } }}
            className="aspect-auto h-[200px] w-full lg:h-[220px]"
          >
            <BarChart data={caseStatusData} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                fontSize={9}
                tickFormatter={(value) => truncateLabel(String(value), 12)}
              />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {caseStatusData.map((item, index) => (
                  <Cell key={item.name} fill={CASE_STATUS_COLORS[index % CASE_STATUS_COLORS.length]} />
                ))}
                <LabelList dataKey="count" position="top" fontSize={10} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </FrameSection>
    </div>
  )
}

export function CrimeProfilePages({ periodA, periodB, isMobile }: CrimeProfilePagesProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [profile, setProfile] = useState<CrimeFocusProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const focusCrime = INDEX_FOCUS_CRIME_ORDER[pageIndex]
  const totalPages = INDEX_FOCUS_CRIME_ORDER.length

  useEffect(() => {
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
  }, [focusCrime, periodA, periodB])

  function goToPage(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= totalPages) return
    setPageIndex(nextIndex)
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base uppercase tracking-wide">
              Crime Profile — {focusCrime}
            </CardTitle>
            <CardDescription>
              Isang page bawat focus crime · PPO pie at breakdowns ay period in review lang
            </CardDescription>
          </div>
          <p className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
            Page {pageIndex + 1} of {totalPages}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pageIndex === 0 || isPending}
            onClick={() => goToPage(pageIndex - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Crime profile pages">
            {INDEX_FOCUS_CRIME_ORDER.map((crime, index) => (
              <button
                key={crime}
                type="button"
                role="tab"
                aria-selected={pageIndex === index}
                aria-label={crime}
                onClick={() => goToPage(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  pageIndex === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pageIndex >= totalPages - 1 || isPending}
            onClick={() => goToPage(pageIndex + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        {isPending && !profile ? (
          <Skeleton className="min-h-[520px] w-full rounded-lg" />
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : profile ? (
          <CrimeProfileFrame profile={profile} isMobile={isMobile} />
        ) : null}
      </CardContent>
    </Card>
  )
}