import { redirect } from "next/navigation"

import { InstallAppCard } from "@/components/pwa/install-app-card"
import { AccessTokenCard } from "@/components/settings/access-token-card"
import { ThemeSettingsCard } from "@/components/settings/theme-settings-card"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { listAccessTokens, type AccessTokenListItem } from "@/lib/access-tokens"
import { getSession } from "@/lib/auth/get-session"
import { isSuperAdmin } from "@/lib/auth/roles"

export default async function SettingsPage() {
  const session = await getSession()

  if (!session || !isSuperAdmin(session.role)) {
    redirect("/")
  }

  let tokens: AccessTokenListItem[] = []
  let tokenError: string | null = null

  try {
    tokens = await listAccessTokens()
  } catch (error) {
    tokenError =
      error instanceof Error
        ? error.message
        : "Unable to load access tokens from Supabase."
  }

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto max-w-2xl space-y-4">
        <ThemeSettingsCard />

        <InstallAppCard />

        {tokenError ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Access Tokens</CardTitle>
              <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{tokenError}</p>
            </CardContent>
          </Card>
        ) : (
          <AccessTokenCard initialTokens={tokens} />
        )}
      </div>
    </DashboardLayout>
  )
}
