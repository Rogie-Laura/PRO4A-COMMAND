import { Scale } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CrimeAnalytics } from "@/lib/crime-types"

type CrimeTotalVolumeCardProps = {
  data: CrimeAnalytics
}

export function CrimeTotalVolumeCard({ data }: CrimeTotalVolumeCardProps) {
  return (
    <Card className="gap-0 overflow-hidden border-rose-500/25 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-card sm:max-w-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Scale className="size-5" aria-hidden />
          <CardDescription className="font-medium text-rose-700/90 dark:text-rose-300/90">
            Index Crime Volume
          </CardDescription>
        </div>
        <CardTitle className="text-4xl font-bold tabular-nums text-rose-700 dark:text-rose-300 sm:text-5xl">
          {data.totalVolume.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-foreground">Total Crime Volume</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.year ? `${data.year} index crime incidents` : "Index crime incidents"} from uploaded
          CSV
        </p>
      </CardContent>
    </Card>
  )
}
