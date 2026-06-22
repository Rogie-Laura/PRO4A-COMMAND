import { ArrowRightLeft, type LucideIcon } from "lucide-react"

import { DetailedPersonnelUnitBreakdown } from "@/components/dashboard/detailed-personnel-unit-breakdown"
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
  breakdownTitle?: string
}

export function DetailedPersonnelSection({
  data,
  icon: Icon = ArrowRightLeft,
  accentClassName = "gap-0 overflow-hidden border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card text-sky-700 dark:text-sky-300 [&_[data-slot=card-description]]:text-sky-700/90 dark:[&_[data-slot=card-description]]:text-sky-300/90",
  breakdownTitle,
}: DetailedPersonnelSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className={accentClassName}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className="size-5" aria-hidden />
              <CardDescription className="font-medium">{data.title}</CardDescription>
            </div>
            <CardTitle className="text-4xl font-bold tabular-nums sm:text-5xl">
              {data.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">Total Personnel on Detail</p>
            <p className="mt-1 text-sm text-muted-foreground">
              From Personnel Google Sheet · {data.dataSource}
            </p>
          </CardContent>
        </Card>

        {data.unitFromStats.length > 0 ? (
          <DetailedPersonnelUnitBreakdown
            items={data.unitFromStats}
            records={data.records}
            breakdownTitle={breakdownTitle ?? `${data.title} by Unit From`}
          />
        ) : null}
      </div>

      {!data.dataReady ? (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang {data.title.toLowerCase()} data pa. Siguraduhing naka-public ang Personnel
            sheet at may records sa tab.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
