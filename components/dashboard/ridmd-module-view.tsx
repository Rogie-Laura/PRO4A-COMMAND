"use client"

import { useState } from "react"

import { CrimeComparativePanel } from "@/components/dashboard/crime-comparative-panel"
import { CrimeIndexPanel } from "@/components/dashboard/crime-index-panel"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CrimeAnalytics } from "@/lib/crime-types"

type RidmdModuleViewProps = {
  data: CrimeAnalytics
}

export function RidmdModuleView({ data }: RidmdModuleViewProps) {
  const [activeTab, setActiveTab] = useState("crime-statistics")

  const crimePanel = <CrimeIndexPanel data={data} />
  const comparativePanel = (
    <CrimeComparativePanel
      dataReady={data.dataReady}
      monthlyBreakdown={data.indexCrime.monthlyBreakdown}
    />
  )

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden gap-4 sm:flex">
        <TabsList>
          <TabsTrigger value="crime-statistics">
            Crime Statistics
            <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
              ({data.indexCrime.totalVolume.toLocaleString()})
            </span>
          </TabsTrigger>
          <TabsTrigger value="comparative">Comparative Crime Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="crime-statistics">{crimePanel}</TabsContent>
        <TabsContent value="comparative">{comparativePanel}</TabsContent>
      </Tabs>

      <div className="sm:hidden">
        <SwipeCarousel
          swipeHint="Swipe: Crime Statistics · Comparative Crime Stats"
          ariaLabel="Regional Investigation and Detection Management Division crime modules"
          slides={[
            {
              id: "crime-statistics",
              label: "Crime Statistics",
              dotClassName: "bg-rose-500",
              content: crimePanel,
            },
            {
              id: "comparative",
              label: "Comparative Crime Stats",
              dotClassName: "bg-sky-500",
              content: comparativePanel,
            },
          ]}
        />
      </div>
    </div>
  )
}
