import { Monitor, MonitorOff } from "lucide-react"

import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { IctOfficeCards } from "@/components/dashboard/ict-office-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getIctEquipmentAnalytics } from "@/lib/ict-equipment-analytics"
import type { IctStatusSection } from "@/lib/ict-equipment-types"
import { cn } from "@/lib/utils"

const STATUS_STYLES = {
  serviceable: {
    card: "border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card",
    icon: "bg-primary/15 text-primary",
    value: "text-primary",
    label: "text-primary/80",
  },
  unserviceable: {
    card: "border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-card dark:border-amber-400/20",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
    label: "text-amber-700/80 dark:text-amber-400/80",
  },
} as const

function BreakdownStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">{value.toLocaleString()}</p>
    </div>
  )
}

function IctStatusSectionGrid({
  section,
  variant,
  officeTitle,
}: {
  section: IctStatusSection
  variant: keyof typeof STATUS_STYLES
  officeTitle: string
}) {
  const styles = STATUS_STYLES[variant]
  const Icon = variant === "serviceable" ? Monitor : MonitorOff

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_1fr]">
      <Card className={cn("gap-0 overflow-hidden", styles.card)}>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                styles.icon,
              )}
            >
              <Icon className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <CardDescription className={cn("font-medium", styles.label)}>
                {section.label}
              </CardDescription>
              <CardTitle
                className={cn("text-4xl font-bold tabular-nums sm:text-5xl", styles.value)}
              >
                {section.breakdown.total.toLocaleString()}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <BreakdownStat label="2025 & Below" value={section.breakdown.year2025Below} />
            <BreakdownStat
              label="As of January 2026"
              value={section.breakdown.asOfJanuary2026}
            />
          </div>
          <p className="text-sm text-muted-foreground">{section.detail}</p>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardDescription className="font-medium">By Office</CardDescription>
          <CardTitle className="text-base">{officeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <IctOfficeCards offices={section.offices} />
        </CardContent>
      </Card>
    </div>
  )
}

export function IctEquipmentLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      ))}
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
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
      </div>

      <DataSyncBanner lastUpdated={data.lastUpdated} sourceLabel={data.dataSource} />

      {!data.dataReady && (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang ICT equipment data mula sa RECAP tab pa. Siguraduhing naka-public ang
            Google Sheet at may Serviceable (row 19) at Unserviceable (row 31) blocks.
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <IctStatusSectionGrid
          section={data.serviceable}
          variant="serviceable"
          officeTitle="Serviceable breakdown"
        />
        <IctStatusSectionGrid
          section={data.unserviceable}
          variant="unserviceable"
          officeTitle="Unserviceable breakdown"
        />
      </div>
    </div>
  )
}
