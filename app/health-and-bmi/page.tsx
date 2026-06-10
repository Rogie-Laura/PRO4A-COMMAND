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
      <div className="space-y-6">
        <DataSyncBanner lastUpdated={data.lastUpdated} />

        {!data.dataReady && (
          <Card className="border-dashed bg-muted/20">
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
