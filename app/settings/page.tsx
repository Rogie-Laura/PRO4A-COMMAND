import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" description="Configure PRO4A COMMAND">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Analytics tracking, notifications, and integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Coming soon — API keys, webhooks, and notification preferences.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
