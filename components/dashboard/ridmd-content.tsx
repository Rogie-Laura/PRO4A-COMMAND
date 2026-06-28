import { CrimeStatisticsRefreshButton } from "@/components/dashboard/crime-statistics-refresh-button"
import { RidmdModuleView } from "@/components/dashboard/ridmd-module-view"
import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCrimeAnalytics } from "@/lib/crime-analytics"

export function RidmdLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
      <Skeleton className="h-9 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}

export async function RidmdContent() {
  const data = await getCrimeAnalytics()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DataSyncBanner
          lastUpdated={data.lastUpdated}
          sourceLabel={data.dataSource}
          syncDescription={
            data.dataReady
              ? "index crime only · synced from Supabase upload"
              : "upload crime stats in Settings (Super Admin)"
          }
        />
        <CrimeStatisticsRefreshButton />
      </div>

      {!data.dataReady ? (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 sm:max-w-xl">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Walang crime data pa. Mag-upload sa Settings (Super Admin) gamit ang PNP-CIRAS Excel
            export — kailangan ang ppo, stn, barangay, YEAR, typeofPlace, dateReported,
            dateCommitted, timeCommitted, crime, at category.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Source file: <span className="font-medium text-foreground">{data.fileName}</span>
            {data.year ? ` · Year ${data.year}` : ""}
            {" · Index crime only"}
          </p>
          <RidmdModuleView data={data} />
        </>
      )}
    </div>
  )
}
