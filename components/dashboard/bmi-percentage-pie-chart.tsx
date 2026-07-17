"use client"

import { useMemo } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { BmiCategoryCount } from "@/lib/health-types"

type BmiPercentagePieChartProps = {
  categories: BmiCategoryCount[]
  totalAssessed: number
}

const BMI_COLORS: Record<BmiCategoryCount["id"], string> = {
  underweight: "#38bdf8",
  normal: "#22c55e",
  acceptable: "#14b8a6",
  overweight: "#f59e0b",
  "obese-1": "#f97316",
  "obese-2": "#f43f5e",
  "obese-3": "#dc2626",
}

export function BmiPercentagePieChart({
  categories,
  totalAssessed,
}: BmiPercentagePieChartProps) {
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          category.id,
          {
            label: category.label,
            color: BMI_COLORS[category.id],
          },
        ]),
      ),
    [categories],
  )

  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle>BMI Classification Percentage</CardTitle>
        <CardDescription>
          Percentage distribution of all personnel with recorded BMI classification
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalAssessed === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No BMI data yet.
          </p>
        ) : (
          <div className="grid items-center gap-6 md:grid-cols-[minmax(280px,1fr)_minmax(260px,0.8fr)]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[300px] w-full max-w-[360px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="id"
                      formatter={(value, _name, item) => {
                        const percentage = item.payload?.percentage ?? 0
                        return (
                          <div className="flex min-w-36 items-center justify-between gap-4">
                            <span>{item.payload?.label ?? "BMI category"}</span>
                            <span className="font-semibold tabular-nums">
                              {Number(value).toLocaleString()} ({percentage}%)
                            </span>
                          </div>
                        )
                      }}
                    />
                  }
                />
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="id"
                  innerRadius={72}
                  outerRadius={126}
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {categories.map((category) => (
                    <Cell key={category.id} fill={BMI_COLORS[category.id]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null

                      const cx = viewBox.cx as number
                      const cy = viewBox.cy as number

                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={cx}
                            dy="-0.35em"
                            fill="var(--muted-foreground)"
                            fontSize={12}
                          >
                            Assessed
                          </tspan>
                          <tspan
                            x={cx}
                            dy="1.35em"
                            fill="var(--foreground)"
                            fontSize={24}
                            fontWeight={700}
                          >
                            {totalAssessed.toLocaleString()}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-background/50 px-3 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: BMI_COLORS[category.id] }}
                    />
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-bold tabular-nums">{category.percentage}%</span>
                    <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                      ({category.count.toLocaleString()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
