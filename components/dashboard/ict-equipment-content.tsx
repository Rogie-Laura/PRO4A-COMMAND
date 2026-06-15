import { ArchiveX, Monitor, MonitorOff } from "lucide-react"

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

const STATUS_VARIANTS = {
  serviceable: {
    shortLabel: "Serviceable",
    card: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-card dark:border-emerald-400/20",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
    label: "text-emerald-700/80 dark:text-emerald-400/80",
    count: "text-emerald-600 dark:text-emerald-400",
    divider: "border-emerald-500/15",
    Icon: Monitor,
  },
  unserviceable: {
    shortLabel: "Unserviceable",
    card: "border-rose-500/25 bg-gradient-to-br from-rose-500/12 via-rose-500/5 to-card dark:border-rose-400/20",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-400",
    label: "text-rose-700/80 dark:text-rose-400/80",
    count: "text-rose-600 dark:text-rose-400",
    divider: "border-rose-500/15",
    Icon: MonitorOff,
  },
  ber: {
    shortLabel: "BER",
    card: "border-orange-500/25 bg-gradient-to-br from-orange-500/12 via-orange-500/5 to-card dark:border-orange-400/20",
    icon: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    value: "text-orange-700 dark:text-orange-400",
    label: "text-orange-700/80 dark:text-orange-400/80",
    count: "text-orange-600 dark:text-orange-400",
    divider: "border-orange-500/15",
    Icon: ArchiveX,
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

function TotalIctEquipmentCard({
  label,
  breakdown,
}: {
  label: string
  breakdown: IctStatusSection["breakdown"]
}) {
  return (
    <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card sm:max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Monitor className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardDescription className="font-medium text-primary/80">{label}</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {breakdown.total.toLocaleString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <BreakdownStat label="2025 & Below" value={breakdown.year2025Below} />
          <BreakdownStat label="As of January 2026" value={breakdown.asOfJanuary2026} />
        </div>
      </CardContent>
    </Card>
  )
}

function IctStatusCard({
  section,
  variant,
}: {
  section: IctStatusSection
  variant: keyof typeof STATUS_VARIANTS
}) {
  const styles = STATUS_VARIANTS[variant]
  const StatusIcon = styles.Icon

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
            <StatusIcon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardDescription className={cn("font-medium", styles.label)}>
              {styles.shortLabel}
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
      <Skeleton className="h-40 max-w-xl rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[28rem] rounded-xl" />
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
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <DataSyncBanner lastUpdated={data.lastUpdated} sourceLabel={data.dataSource} />

      {!data.dataReady && (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang ICT equipment data mula sa RECAP tab pa. Siguraduhing naka-public ang
            Google Sheet at may Serviceable, Unserviceable, at BER blocks.
          </CardContent>
        </Card>
      )}

      <TotalIctEquipmentCard
        label={data.grandTotal.label}
        breakdown={data.grandTotal.breakdown}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <IctStatusCard section={data.serviceable} variant="serviceable" />
        <IctStatusCard section={data.unserviceable} variant="unserviceable" />
        <IctStatusCard section={data.ber} variant="ber" />
      </div>
    </div>
  )
}
