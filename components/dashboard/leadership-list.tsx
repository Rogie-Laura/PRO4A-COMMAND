import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { LeadershipRow } from "@/lib/personnel-types"

type LeadershipListProps = {
  rows: LeadershipRow[]
}

export function LeadershipList({ rows }: LeadershipListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Leadership</CardTitle>
        <CardDescription>Senior officers — PCOL rank and above</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] sm:h-[320px]">
          <div className="divide-y">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <Badge variant="outline" className="mt-0.5 shrink-0 font-mono text-xs">
                  {row.rank}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{row.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {row.designation}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {row.subUnit} · {row.status}
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
