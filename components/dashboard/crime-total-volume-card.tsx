import { Scale } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CrimeCategoryStats } from "@/lib/crime-types"

type CrimeTotalVolumeCardProps = {
  stats: CrimeCategoryStats
  title: string
  subtitle: string
}

function formatCoveredPeriod(stats: CrimeCategoryStats) {
  if (!stats.coveredPeriodStart) return null

  if (stats.coveredPeriodEnd) {
    return `${stats.coveredPeriodStart} – ${stats.coveredPeriodEnd}`
  }

  return stats.coveredPeriodStart
}

export function CrimeTotalVolumeCard({ stats, title, subtitle }: CrimeTotalVolumeCardProps) {
  const coveredPeriod = formatCoveredPeriod(stats)

  return (
    <Card className="gap-0 overflow-hidden border-rose-500/25 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Scale className="size-5" aria-hidden />
          <CardDescription className="font-medium text-rose-700/90 dark:text-rose-300/90">
            {title}
          </CardDescription>
        </div>
        <CardTitle className="text-4xl font-bold tabular-nums text-rose-700 dark:text-rose-300 sm:text-5xl">
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
