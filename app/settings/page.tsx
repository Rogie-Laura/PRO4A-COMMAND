import { InstallAppCard } from "@/components/pwa/install-app-card"
import { ThemeSettingsCard } from "@/components/settings/theme-settings-card"
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
    <DashboardLayout title="Settings">
      <div className="mx-auto max-w-2xl space-y-4">
        <ThemeSettingsCard />

        <InstallAppCard />

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
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
      </div>
    </DashboardLayout>
  )
}
