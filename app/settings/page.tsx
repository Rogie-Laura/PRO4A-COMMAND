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

export default async function SettingsPage() {
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
              <p className="mt-2 text-sm text-muted-foreground">
                Idagdag sa Vercel env:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                at{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <AccessTokenCard initialTokens={tokens} />
        )}
      </div>
    </DashboardLayout>
  )
}
