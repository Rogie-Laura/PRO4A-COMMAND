import {
  AlertTriangle,
  Eye,
  MousePointerClick,
  ShoppingCart,
  UserPlus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { recentActivity, type ActivityItem } from "@/lib/analytics-data"

const activityIcons: Record<ActivityItem["type"], React.ReactNode> = {
  view: <Eye className="size-4 text-blue-400" />,
  click: <MousePointerClick className="size-4 text-violet-400" />,
  signup: <UserPlus className="size-4 text-emerald-400" />,
  purchase: <ShoppingCart className="size-4 text-amber-400" />,
  alert: <AlertTriangle className="size-4 text-orange-400" />,
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Live events from your analytics stream</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] sm:h-[320px]">
          <div className="divide-y">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {activityIcons[item.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{item.action}</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.target}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.user} · {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
