import { FirearmsSourceChart } from "@/components/dashboard/firearms-source-chart"
import { FirearmsUnitCards } from "@/components/dashboard/firearms-unit-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { aggregateFirearmsSourceBreakdown } from "@/lib/firearms-analytics"
import type { FirearmsCategorySummary } from "@/lib/firearms-types"

type FirearmsCategorySectionProps = {
  category: FirearmsCategorySummary
  dataReady: boolean
}

export function FirearmsCategorySection({ category, dataReady }: FirearmsCategorySectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-primary/80">
              Total Number of Firearms
            </CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {category.grandTotal.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">{category.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dataReady
                ? "Distribution by unit/office (PRO CALABARZON)"
                : "Upload firearms.xlsx in Settings to load summary data."}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">{category.label} Distribution</CardTitle>
            <CardDescription className="text-xs">
              RHQ · Cavite · Laguna · Batangas · Rizal · Quezon · RMFB · On-Stock
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <FirearmsUnitCards units={category.units} categoryLabel={category.label} />
          </CardContent>
        </Card>
      </div>

      {dataReady ? (
        <FirearmsSourceChart
          source={aggregateFirearmsSourceBreakdown(category.units)}
          categoryLabel={category.label}
        />
      ) : null}
    </div>
  )
}
