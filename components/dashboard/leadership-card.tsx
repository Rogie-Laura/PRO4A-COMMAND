import { RankInsignia } from "@/components/dashboard/rank-insignia"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LeadershipRow } from "@/lib/personnel-types"

/** Matches Regional Command Group (4 entries) so all leadership cards share one height. */
const LEADERSHIP_LIST_HEIGHT = "h-[19.5rem]"

type LeadershipCardProps = {
  title: string
  description: string
  rows: LeadershipRow[]
}

export function LeadershipCard({ title, description, rows }: LeadershipCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <div className={`divide-y overflow-y-auto ${LEADERSHIP_LIST_HEIGHT}`}>
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:gap-4 sm:px-5 sm:py-3.5"
            >
              {row.vacant ? (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/30 text-xs text-muted-foreground">
                  —
                </div>
              ) : (
                <RankInsignia rank={row.rank} />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    row.vacant
                      ? "text-sm font-medium text-muted-foreground italic"
                      : "text-sm font-semibold"
                  }
                >
                  {row.name}
                </p>
                {!row.vacant && (
                  <p className="mt-0.5 text-xs font-medium text-primary">{row.rank}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{row.designation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
