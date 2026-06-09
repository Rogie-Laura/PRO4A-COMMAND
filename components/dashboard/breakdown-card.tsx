import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CountItem } from "@/lib/personnel-types"

type BreakdownCardProps = {
  title: string
  description: string
  items: CountItem[]
}

export function BreakdownCard({ title, description, items }: BreakdownCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {item.count.toLocaleString()} · {item.percentage}%
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
