import { GraduationCap, type LucideIcon } from "lucide-react"

import { SchoolingSubUnitBreakdown } from "@/components/dashboard/schooling-subunit-breakdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SchoolingAnalytics } from "@/lib/schooling-types"

type SchoolingSectionProps = {
  data: SchoolingAnalytics
  icon?: LucideIcon
  accentClassName?: string
  breakdownTitle?: string
}

export function SchoolingSection({
  data,
  icon: Icon = GraduationCap,
  accentClassName = "border-indigo-500/25 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-card text-indigo-700 dark:text-indigo-300 [&_[data-slot=card-description]]:text-indigo-700/90 dark:[&_[data-slot=card-description]]:text-indigo-300/90",
  breakdownTitle,
}: SchoolingSectionProps) {
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
            <p className="text-sm font-medium text-foreground">Total Personnel on Schooling</p>
            <p className="mt-1 text-sm text-muted-foreground">
              From Personnel Google Sheet · {data.dataSource}
            </p>
          </CardContent>
        </Card>

        {data.subUnitStats.length > 0 ? (
          <SchoolingSubUnitBreakdown
            items={data.subUnitStats}
            records={data.records}
            breakdownTitle={breakdownTitle ?? `${data.title} by Sub-Unit`}
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
