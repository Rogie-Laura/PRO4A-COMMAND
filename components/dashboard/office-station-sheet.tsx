"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { OfficeBreakdownItem } from "@/lib/personnel-types"

type OfficeStationSheetProps = {
  office: OfficeBreakdownItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const chartConfig = {
  pco: { label: "PCO", color: "var(--chart-1)" },
  pnco: { label: "PNCO", color: "var(--chart-2)" },
}

export function OfficeStationSheet({ office, open, onOpenChange }: OfficeStationSheetProps) {
  const chartHeight = useMemo(() => {
    if (!office) return 280
    return Math.max(280, office.stations.length * 36 + 48)
  }, [office])

  const totals = useMemo(() => {
    if (!office) return { pco: 0, pnco: 0, total: 0 }
    return office.stations.reduce(
      (acc, item) => ({
        pco: acc.pco + item.pco,
        pnco: acc.pnco + item.pnco,
        total: acc.total + item.total,
      }),
      { pco: 0, pnco: 0, total: 0 },
    )
  }, [office])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
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
                  <SheetTitle>{office.label}</SheetTitle>
                  <SheetDescription>
                    {office.stations.length} sub-units · {totals.total.toLocaleString()} uniformed
                    (PCO {totals.pco.toLocaleString()} · PNCO {totals.pnco.toLocaleString()})
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="px-4 pb-6">
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
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="station"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      width={130}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="pco" fill="var(--color-pco)" radius={[0, 4, 4, 0]} barSize={14} />
                    <Bar dataKey="pnco" fill="var(--color-pnco)" radius={[0, 4, 4, 0]} barSize={14} />
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
