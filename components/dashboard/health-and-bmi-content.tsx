import { BmiCategoryCards } from "@/components/dashboard/bmi-category-cards"
import { HealthAndBmiRefreshButton } from "@/components/dashboard/health-and-bmi-refresh-button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getHealthAnalytics } from "@/lib/health-analytics"

export function HealthAndBmiLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export async function HealthAndBmiContent() {
  const data = await getHealthAnalytics()

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl"
      >
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
      </div>
      <div className="flex justify-end">
        <HealthAndBmiRefreshButton />
      </div>

      {!data.dataReady && (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang BMI records pa. Mag-upload sa Settings (Super Admin) gamit ang Excel format, o
            siguraduhing naka-public ang Google Sheet fallback para sa RICTMD personnel.
          </CardContent>
        </Card>
      )}

      <BmiCategoryCards categories={data.categories} totalAssessed={data.totalAssessed} />
    </div>
  )
}
