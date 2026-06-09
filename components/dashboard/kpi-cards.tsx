import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { KpiMetric } from "@/lib/personnel-types"

type KpiCardsProps = {
  metrics: KpiMetric[]
}

export function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
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
  )
}
