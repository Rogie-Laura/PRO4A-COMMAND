"use client"

import { useMemo } from "react"
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
  const chartHeight = useMemo(() => {
    if (!office) return 400
    return Math.max(400, office.stations.length * 44 + 72)
  }, [office])

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
        className="h-full w-screen max-w-none overflow-y-auto sm:w-[98vw]"
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

            <div className="px-4 pb-8">
              <p className="mt-4 text-sm text-muted-foreground">
                Uniformed personnel per sub-unit. Hover or focus a bar to see PCO, PNCO, and NUP
                breakdown.
              </p>

              {office.stations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Walang station data para sa office na ito.
                </p>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="mt-4 aspect-auto w-full"
                  style={{ height: chartHeight }}
                >
                  <BarChart
                    data={office.stations}
                    layout="vertical"
                    margin={{ top: 8, right: 56, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={13} />
                    <YAxis
                      type="category"
                      dataKey="station"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      width={200}
                    />
                    <ChartTooltip content={<StationTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
                    <Bar
                      dataKey="uniformed"
                      fill="var(--color-uniformed)"
                      radius={[0, 4, 4, 0]}
                      barSize={22}
                    >
                      <LabelList
                        dataKey="uniformed"
                        position="right"
                        className="fill-foreground text-xs font-semibold tabular-nums"
                        formatter={(value) =>
                          typeof value === "number" ? value.toLocaleString() : String(value)
                        }
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
