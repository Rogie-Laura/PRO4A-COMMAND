import { RankInsignia } from "@/components/dashboard/rank-insignia"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LeadershipRow } from "@/lib/personnel-types"

type LeadershipListProps = {
  rows: LeadershipRow[]
}

export function LeadershipList({ rows }: LeadershipListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Leadership</CardTitle>
        <CardDescription>Regional command staff</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
            >
              <RankInsignia rank={row.rank} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{row.name}</p>
                <p className="mt-0.5 text-xs font-medium text-primary">{row.rank}</p>
                <p className="mt-1 text-xs text-muted-foreground">{row.designation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
