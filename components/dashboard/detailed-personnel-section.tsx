import { ArrowRightLeft, type LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DetailedPersonnelAnalytics } from "@/lib/detailed-personnel-types"

type DetailedPersonnelSectionProps = {
  data: DetailedPersonnelAnalytics
  icon?: LucideIcon
  accentClassName?: string
}

export function DetailedPersonnelSection({
  data,
  icon: Icon = ArrowRightLeft,
  accentClassName = "h-full gap-0 overflow-hidden border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card text-sky-700 dark:text-sky-300 [&_[data-slot=card-description]]:text-sky-700/90 dark:[&_[data-slot=card-description]]:text-sky-300/90",
}: DetailedPersonnelSectionProps) {
  return (
    <Card className={accentClassName}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="size-5 shrink-0" aria-hidden />
          <CardDescription className="font-medium">{data.title}</CardDescription>
        </div>
        <CardTitle className="text-4xl font-bold tabular-nums sm:text-5xl">
          {data.total.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-foreground">Total Personnel on Detail</p>
        {!data.dataReady ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Walang data pa sa tab na ito.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
