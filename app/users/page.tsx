import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function UsersPage() {
  return (
    <DashboardLayout title="Users" description="User analytics and audience insights">
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
          <CardDescription>
            Track user behavior, segments, and retention metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Coming soon — user segments, cohort analysis, and retention charts.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
