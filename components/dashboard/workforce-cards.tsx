import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { WorkforceSummary } from "@/lib/personnel-types"

type WorkforceCardsProps = {
  workforce: WorkforceSummary
}

export function WorkforceCards({ workforce }: WorkforceCardsProps) {
  const { uniformed, nup, gender } = workforce

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardDescription>Total Uniformed Personnel</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
            {uniformed.total.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">PCO</span>
            <span className="font-semibold tabular-nums">{uniformed.pco.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">PNCO</span>
            <span className="font-semibold tabular-nums">{uniformed.pnco.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardDescription>Total NUP</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
            {nup.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Non-Uniformed Personnel</p>
        </CardContent>
      </Card>

      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gender.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.count.toLocaleString()} · {item.percentage}%
                </span>
              </div>
              <Progress value={item.percentage} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
