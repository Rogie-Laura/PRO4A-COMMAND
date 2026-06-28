"use client"

import { CrimeCategoryPanel } from "@/components/dashboard/crime-category-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CrimeAnalytics } from "@/lib/crime-types"

type CrimeStatisticsTabsProps = {
  data: CrimeAnalytics
}

export function CrimeStatisticsTabs({ data }: CrimeStatisticsTabsProps) {
  return (
    <Tabs defaultValue="index" className="gap-4">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="index" className="flex-1 sm:flex-none">
          Index Crime
          <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
            ({data.indexCrime.totalVolume.toLocaleString()})
          </span>
        </TabsTrigger>
        <TabsTrigger value="non-index" className="flex-1 sm:flex-none">
          Non-Index Crime
          <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
            ({data.nonIndexCrime.totalVolume.toLocaleString()})
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="index">
        <CrimeCategoryPanel
          stats={data.indexCrime}
          variant="index"
          volumeTitle="Index Crime Volume"
          volumeSubtitle="Total index crimes (category = INDEX)"
          ppoTitle="Index Crime by PPO"
          ppoDescription="Distribution per provincial office"
        />
      </TabsContent>

      <TabsContent value="non-index">
        <CrimeCategoryPanel
          stats={data.nonIndexCrime}
          variant="non-index"
          volumeTitle="Non-Index Crime Volume"
          volumeSubtitle="Total non-index crimes (PSI at iba pa)"
          ppoTitle="Non-Index Crime by PPO"
          ppoDescription="Distribution per provincial office"
        />
      </TabsContent>
    </Tabs>
  )
}
