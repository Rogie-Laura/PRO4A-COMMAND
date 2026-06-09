import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports" description="Generate and export analytics reports">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Scheduled and on-demand analytics reports will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Coming soon — daily, weekly, and custom report exports.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
