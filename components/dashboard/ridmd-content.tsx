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
            Walang crime data pa. Mag-upload ng PNP-CRAS export sa{" "}
            <span className="font-medium text-foreground">RIDMD → Upload File</span> o sa Settings
            (Super Admin) — INDEX crimes lang mula 2026 pataas.
          </CardContent>
        </Card>
      ) : (
        <RidmdModuleView data={data} />
      )}
    </div>
  )
}
