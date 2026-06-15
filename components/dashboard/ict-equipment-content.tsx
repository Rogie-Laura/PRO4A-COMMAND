import { Laptop, Monitor } from "lucide-react"

import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getIctEquipmentAnalytics } from "@/lib/ict-equipment-analytics"
import type { IctDeviceMetric } from "@/lib/ict-equipment-types"
import { cn } from "@/lib/utils"

const DEVICE_CARD_STYLES = {
  desktop:
    "border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card dark:border-sky-400/20",
  laptop:
    "border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-card dark:border-violet-400/20",
} as const

const DEVICE_ICON_STYLES = {
  desktop: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  laptop: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
} as const

const DEVICE_ICONS = {
  desktop: Monitor,
  laptop: Laptop,
} as const

function DeviceMetricCard({ metric }: { metric: IctDeviceMetric }) {
  const Icon = DEVICE_ICONS[metric.id]

  return (
    <Card className={cn("gap-0 overflow-hidden", DEVICE_CARD_STYLES[metric.id])}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              DEVICE_ICON_STYLES[metric.id],
            )}
          >
            <Icon className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardDescription className="font-medium">{metric.label}</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums sm:text-5xl">
              {metric.value.toLocaleString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{metric.detail}</p>
      </CardContent>
    </Card>
  )
}

export function IctEquipmentLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  )
}

export async function IctEquipmentContent() {
  const data = await getIctEquipmentAnalytics()

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl"
      >
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <DataSyncBanner lastUpdated={data.lastUpdated} sourceLabel={data.dataSource} />

      {!data.dataReady && (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang ICT equipment data mula sa RECAP tab pa. Siguraduhing naka-public ang
            Google Sheet at may Total row na may Total Desktop at Total Laptop.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <DeviceMetricCard metric={data.totalDesktop} />
        <DeviceMetricCard metric={data.totalLaptop} />
      </div>
    </div>
  )
}
