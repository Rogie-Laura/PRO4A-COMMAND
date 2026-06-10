import { BmiCategoryCards } from "@/components/dashboard/bmi-category-cards"
import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getHealthAnalytics } from "@/lib/health-analytics"

export default async function HealthAndBmiPage() {
  const data = await getHealthAnalytics()

  return (
    <DashboardLayout
      title="Health and BMI"
      description="Personnel body mass index classification"
    >
      <div className="relative space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl"
        >
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        </div>
        <DataSyncBanner lastUpdated={data.lastUpdated} />

        {!data.dataReady && (
          <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Walang BMI data sa Health and BMI sheet pa. Magdagdag ng tab na
              &quot;Health and BMI&quot; with columns: BMI Category (or BMI / Weight / Height).
            </CardContent>
          </Card>
        )}

        <BmiCategoryCards categories={data.categories} totalAssessed={data.totalAssessed} />
      </div>
    </DashboardLayout>
  )
}
