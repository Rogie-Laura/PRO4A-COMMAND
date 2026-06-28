"use client"

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, XAxis, YAxis } from "recharts"

import { fetchCrimeFocusProfileAction } from "@/app/(dashboard)/ridmd/actions"
import {
  ComparativeBarTotalLabel,
  comparativeBarChartConfig,
  createPeriodBChangeLabel,
} from "@/components/dashboard/crime-comparative-chart-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { buildCountChangeMetrics, type CrimePeriodRange } from "@/lib/crime-comparative"
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

type CrimeProfileSlideProps = {
  focusCrime: string
  periodA: CrimePeriodRange
  periodB: CrimePeriodRange
  isMobile: boolean
}

function truncateLabel(value: string, max = 22) {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function ProfilePanel({
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
    <Card className={cn("h-full gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="border-b bg-muted/20 px-4 py-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide">{title}</CardTitle>
        {description ? <CardDescription className="text-xs">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex min-h-[220px] flex-1 items-center p-3 sm:p-4">{children}</CardContent>
    </Card>
  )
}

export function CrimeProfileSlide({ focusCrime, periodA, periodB, isMobile }: CrimeProfileSlideProps) {
  const [profile, setProfile] = useState<CrimeFocusProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
            : "Hindi ma-load ang crime profile slide.",
        )
      }
    })
  }, [focusCrime, periodA, periodB])

  const comparisonRows = useMemo(() => {
    if (!profile) return []

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
      (profile?.typeofPlaceBreakdown ?? []).slice(0, isMobile ? 6 : 8).map((item) => ({
        label: item.name,
        shortLabel: truncateLabel(item.name, isMobile ? 14 : 18),
        count: item.count,
      })),
    [profile?.typeofPlaceBreakdown, isMobile],
  )

  const ppoPieData = useMemo(() => {
    if (!profile) return []

    return buildCrimePpoBreakdownItems(profile.ppoDistribution, profile.comparison.periodB)
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.shortLabel,
        fullName: item.label,
        count: item.count,
        percentage: item.percentage,
      }))
  }, [profile])

  const caseStatusData = useMemo(
    () => profile?.caseStatusBreakdown ?? [],
    [profile?.caseStatusBreakdown],
  )

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

  if (isPending && !profile) {
    return <Skeleton className="min-h-[560px] w-full rounded-xl" />
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold uppercase tracking-wide sm:text-xl">
          Crime Profile — {profile.crime}
        </h2>
        <p className="text-sm text-muted-foreground">
          Previous period vs period in review · PPO pie at breakdowns ay period in review lang
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ProfilePanel
          title="Previous vs Period in Review"
          description={profile.crime}
        >
          {comparisonRows.length === 0 ? (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">Walang data.</p>
          ) : (
            <ChartContainer
              config={comparativeBarChartConfig}
              className="aspect-auto h-[280px] w-full lg:h-full lg:min-h-[320px]"
            >
              <BarChart
                data={comparisonRows}
                margin={{ top: 72, right: 8, left: 0, bottom: 8 }}
                barCategoryGap="28%"
                barGap={8}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} width={40} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="periodA"
                  name="Previous period"
                  fill="var(--color-periodA)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                >
                  <LabelList dataKey="periodA" content={<ComparativeBarTotalLabel />} />
                </Bar>
                <Bar
                  dataKey="periodB"
                  name="Period in review"
                  fill="var(--color-periodB)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                >
                  <LabelList dataKey="periodB" content={periodBChangeLabel} />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </ProfilePanel>

        <ProfilePanel
          title="Type of Place"
          description={`Period in review · ${profile.periodBLabel}`}
        >
          {typeofPlaceData.length === 0 ? (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">Walang data.</p>
          ) : (
            <ChartContainer
              config={{ count: { label: "Incidents", color: "var(--chart-2)" } }}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart
                data={typeofPlaceData}
                layout="vertical"
                margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 92 : 120}
                  fontSize={10}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        String(payload?.[0]?.payload?.label ?? "")
                      }
                    />
                  }
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  <LabelList dataKey="count" position="right" fontSize={10} />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </ProfilePanel>

        <ProfilePanel
          title="PPO Distribution"
          description={`Period in review · ${profile.periodBLabel}`}
        >
          {ppoPieData.length === 0 ? (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">Walang data.</p>
          ) : (
            <div className="grid w-full gap-3">
              <ChartContainer
                config={ppoChartConfig}
                className="mx-auto aspect-square h-[180px] w-full max-w-[220px]"
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
                    innerRadius={42}
                    outerRadius={78}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {ppoPieData.map((item, index) => (
                      <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="space-y-1.5">
                {ppoPieData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="truncate font-medium">{item.fullName}</span>
                    </div>
                    <span className="shrink-0 tabular-nums">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ProfilePanel>

        <ProfilePanel
          title="Case Status"
          description={`Period in review · ${profile.periodBLabel}`}
        >
          {caseStatusData.length === 0 ? (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">Walang data.</p>
          ) : (
            <ChartContainer
              config={{ count: { label: "Incidents", color: "var(--chart-3)" } }}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart data={caseStatusData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  fontSize={10}
                  tickFormatter={(value) => truncateLabel(String(value), 14)}
                />
                <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {caseStatusData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={CASE_STATUS_COLORS[index % CASE_STATUS_COLORS.length]}
                    />
                  ))}
                  <LabelList dataKey="count" position="top" fontSize={11} />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </ProfilePanel>
      </div>
    </div>
  )
}
