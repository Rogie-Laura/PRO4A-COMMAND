import { OfficeLogo } from "@/components/dashboard/office-logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { KpiMetric, OfficeBreakdownItem } from "@/lib/personnel-types"

type TotalPersonnelSectionProps = {
  total: KpiMetric
  offices: OfficeBreakdownItem[]
  otherMetrics: KpiMetric[]
}

export function TotalPersonnelSection({
  total,
  offices,
  otherMetrics,
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

        <Card className="gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Offices</CardTitle>
            <CardDescription>Personnel count per office</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {offices.map((office) => (
                <div
                  key={office.subUnit}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <OfficeLogo
                      src={office.logo}
                      alt={office.label}
                      fallback={office.shortLabel}
                      colorClass={office.colorClass}
                    />
                    <span className="truncate text-sm font-medium">{office.label}</span>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                    {office.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {otherMetrics.map((metric) => (
          <Card key={metric.id} className="gap-0">
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
