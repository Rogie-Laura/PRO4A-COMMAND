import { ArrowDown, ArrowUp, Minus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { kpiMetrics } from "@/lib/analytics-data"

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpiMetrics.map((metric) => (
        <Card key={metric.id} className="gap-0">
          <CardHeader className="pb-2">
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
              {metric.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  metric.trend === "up"
                    ? "default"
                    : metric.trend === "down"
                      ? "destructive"
                      : "secondary"
                }
                className="gap-1 tabular-nums"
              >
                {metric.trend === "up" && <ArrowUp className="size-3" />}
                {metric.trend === "down" && <ArrowDown className="size-3" />}
                {metric.trend === "neutral" && <Minus className="size-3" />}
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                {metric.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
