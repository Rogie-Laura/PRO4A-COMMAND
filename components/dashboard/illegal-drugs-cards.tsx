import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IllegalDrugsSheetCard } from "@/components/dashboard/illegal-drugs-sheet-card"
import type { IllegalDrugsAnalytics } from "@/lib/illegal-drugs-types"

type IllegalDrugsCardsProps = {
  analytics: IllegalDrugsAnalytics
}

export function IllegalDrugsCards({ analytics }: IllegalDrugsCardsProps) {
  if (!analytics.dataReady || (!analytics.hvi && !analytics.sli)) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Illegal Drugs</CardTitle>
          <CardDescription>
            Walang illegal drugs data pa. Mag-upload ng ILLEGAL DRUGS.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {analytics.hvi ? (
        <IllegalDrugsSheetCard
          summary={analytics.hvi}
          accentClass="from-amber-500/10 border-amber-500/20"
        />
      ) : null}
      {analytics.sli ? (
        <IllegalDrugsSheetCard
          summary={analytics.sli}
          accentClass="from-violet-500/10 border-violet-500/20"
        />
      ) : null}
    </div>
  )
}
