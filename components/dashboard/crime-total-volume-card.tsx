import { Scale } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CrimeCategoryStats } from "@/lib/crime-types"
import { cn } from "@/lib/utils"

type CrimeTotalVolumeCardProps = {
  stats: CrimeCategoryStats
  title: string
  subtitle: string
  variant: "index" | "non-index"
}

function formatCoveredPeriod(stats: CrimeCategoryStats) {
  if (!stats.coveredPeriodStart) return null

  if (stats.coveredPeriodEnd) {
    return `${stats.coveredPeriodStart} – ${stats.coveredPeriodEnd}`
  }

  return stats.coveredPeriodStart
}

const variantStyles = {
  index: {
    card: "border-rose-500/25 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-card",
    icon: "text-rose-600 dark:text-rose-400",
    label: "text-rose-700/90 dark:text-rose-300/90",
    value: "text-rose-700 dark:text-rose-300",
  },
  "non-index": {
    card: "border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card",
    icon: "text-sky-600 dark:text-sky-400",
    label: "text-sky-700/90 dark:text-sky-300/90",
    value: "text-sky-700 dark:text-sky-300",
  },
} as const

export function CrimeTotalVolumeCard({
  stats,
  title,
  subtitle,
  variant,
}: CrimeTotalVolumeCardProps) {
  const coveredPeriod = formatCoveredPeriod(stats)
  const styles = variantStyles[variant]

  return (
    <Card className={cn("gap-0 overflow-hidden", styles.card)}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center gap-2", styles.icon)}>
          <Scale className="size-5" aria-hidden />
          <CardDescription className={cn("font-medium", styles.label)}>{title}</CardDescription>
        </div>
        <CardTitle
          className={cn("text-4xl font-bold tabular-nums sm:text-5xl", styles.value)}
        >
          {stats.totalVolume.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm font-medium text-foreground">{subtitle}</p>
        {coveredPeriod ? (
          <p className="text-sm text-muted-foreground">Covered Period {coveredPeriod}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
