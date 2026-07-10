import { CrimeStatisticsRefreshButton } from "@/components/dashboard/crime-statistics-refresh-button"
import { RidmdModuleView } from "@/components/dashboard/ridmd-module-view"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCrimeAnalytics } from "@/lib/crime-analytics"

export function RidmdLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}

export async function RidmdContent() {
  const data = await getCrimeAnalytics()

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CrimeStatisticsRefreshButton />
      </div>

      {!data.dataReady ? (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 sm:max-w-xl">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Walang crime data pa. Mag-upload sa Settings (Super Admin) gamit ang PNP-CIRAS incident
            export — INDEX at NON INDEX rows lang (Column2), kasama ang modus at offense.
          </CardContent>
        </Card>
      ) : (
        <RidmdModuleView data={data} />
      )}
    </div>
  )
}
