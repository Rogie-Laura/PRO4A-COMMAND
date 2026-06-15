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
    card: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-card dark:border-emerald-400/20",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
    label: "text-emerald-700/80 dark:text-emerald-400/80",
    count: "text-emerald-600 dark:text-emerald-400",
    divider: "border-emerald-500/15",
  },
  unserviceable: {
    card: "border-rose-500/25 bg-gradient-to-br from-rose-500/12 via-rose-500/5 to-card dark:border-rose-400/20",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-400",
    label: "text-rose-700/80 dark:text-rose-400/80",
    count: "text-rose-600 dark:text-rose-400",
    divider: "border-rose-500/15",
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

function IctStatusCard({
  section,
  variant,
}: {
  section: IctStatusSection
  variant: keyof typeof STATUS_STYLES
}) {
  const styles = STATUS_STYLES[variant]
  const Icon = variant === "serviceable" ? Monitor : MonitorOff
  const shortLabel = variant === "serviceable" ? "Serviceable" : "Unserviceable"

  return (
    <Card className={cn("gap-0 overflow-hidden", styles.card)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              styles.icon,
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardDescription className={cn("font-medium", styles.label)}>
              {shortLabel}
            </CardDescription>
            <CardTitle className={cn("text-3xl font-bold tabular-nums sm:text-4xl", styles.value)}>
              {section.breakdown.total.toLocaleString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <BreakdownStat label="2025 & Below" value={section.breakdown.year2025Below} />
          <BreakdownStat label="As of January 2026" value={section.breakdown.asOfJanuary2026} />
        </div>

        <div className={cn("border-t pt-4", styles.divider)}>
          <p className="mb-3 text-sm font-medium text-foreground">Breakdown by PPO</p>
          <IctOfficeCards offices={section.offices} countClassName={styles.count} />
        </div>
      </CardContent>
    </Card>
  )
}

export function IctEquipmentLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[28rem] rounded-xl" />
        <Skeleton className="h-[28rem] rounded-xl" />
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
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />
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

      <div className="grid gap-4 lg:grid-cols-2">
        <IctStatusCard section={data.serviceable} variant="serviceable" />
        <IctStatusCard section={data.unserviceable} variant="unserviceable" />
      </div>
    </div>
  )
}
