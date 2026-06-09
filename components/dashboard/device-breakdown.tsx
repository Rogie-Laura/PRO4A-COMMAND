import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { deviceStats } from "@/lib/analytics-data"

export function DeviceBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Breakdown</CardTitle>
        <CardDescription>Session distribution by device type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {deviceStats.map((stat) => (
          <div key={stat.device} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stat.device}</span>
              <span className="tabular-nums text-muted-foreground">
                {stat.percentage}% · {stat.sessions.toLocaleString()} sessions
              </span>
            </div>
            <Progress value={stat.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
