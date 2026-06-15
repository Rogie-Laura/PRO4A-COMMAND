import { ArchiveX, Monitor, MonitorOff, Package, Shield } from "lucide-react"

import { IctOfficeCards } from "@/components/dashboard/ict-office-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { IctStatusSection } from "@/lib/ict-equipment-types"
import { cn } from "@/lib/utils"

export const ICT_STATUS_VARIANTS = {
  serviceable: {
    shortLabel: "Serviceable",
    card: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-card dark:border-emerald-400/20",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
    label: "text-emerald-700/80 dark:text-emerald-400/80",
    count: "text-emerald-600 dark:text-emerald-400",
    divider: "border-emerald-500/15",
    dot: "bg-emerald-500",
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
    dot: "bg-rose-500",
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
    dot: "bg-orange-500",
    Icon: ArchiveX,
  },
  pnpNhq: {
    shortLabel: "PNP Issued by NHQ",
    card: "border-sky-500/25 bg-gradient-to-br from-sky-500/12 via-sky-500/5 to-card dark:border-sky-400/20",
    icon: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    value: "text-sky-700 dark:text-sky-400",
    label: "text-sky-700/80 dark:text-sky-400/80",
    count: "text-sky-600 dark:text-sky-400",
    divider: "border-sky-500/15",
    dot: "bg-sky-500",
    Icon: Shield,
  },
  procuredPro: {
    shortLabel: "Procured by PRO",
    card: "border-violet-500/25 bg-gradient-to-br from-violet-500/12 via-violet-500/5 to-card dark:border-violet-400/20",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    value: "text-violet-700 dark:text-violet-400",
    label: "text-violet-700/80 dark:text-violet-400/80",
    count: "text-violet-600 dark:text-violet-400",
    divider: "border-violet-500/15",
    dot: "bg-violet-500",
    Icon: Package,
  },
} as const

export type IctStatusVariant = keyof typeof ICT_STATUS_VARIANTS

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

export function IctStatusCard({
  section,
  variant,
  className,
  compactOffices = false,
}: {
  section: IctStatusSection
  variant: IctStatusVariant
  className?: string
  compactOffices?: boolean
}) {
  const styles = ICT_STATUS_VARIANTS[variant]
  const StatusIcon = styles.Icon

  return (
    <Card className={cn("flex h-full gap-0 overflow-hidden", styles.card, className)}>
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

      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className={cn("grid gap-2", compactOffices ? "grid-cols-1" : "gap-3 sm:grid-cols-2")}>
          <BreakdownStat label="2025 & Below" value={section.breakdown.year2025Below} />
          <BreakdownStat label="As of January 2026" value={section.breakdown.asOfJanuary2026} />
        </div>

        <div className={cn("mt-auto border-t pt-4", styles.divider)}>
          <p className="mb-3 text-sm font-medium text-foreground">Breakdown by PPO</p>
          <IctOfficeCards
            offices={section.offices}
            countClassName={styles.count}
            compact={compactOffices}
          />
        </div>
      </CardContent>
    </Card>
  )
}
