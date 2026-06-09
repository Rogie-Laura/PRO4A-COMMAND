import { OfficeCards } from "@/components/dashboard/office-cards"
import { WorkforceCards } from "@/components/dashboard/workforce-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { KpiMetric, OfficeBreakdownItem, WorkforceSummary } from "@/lib/personnel-types"

type TotalPersonnelSectionProps = {
  total: KpiMetric
  offices: OfficeBreakdownItem[]
  workforce: WorkforceSummary
}

export function TotalPersonnelSection({
  total,
  offices,
  workforce,
}: TotalPersonnelSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="gap-0 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/80">
              {total.label}
            </CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {total.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{total.detail}</p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <OfficeCards offices={offices} />
          </CardContent>
        </Card>
      </div>

      <WorkforceCards workforce={workforce} />
    </div>
  )
}
