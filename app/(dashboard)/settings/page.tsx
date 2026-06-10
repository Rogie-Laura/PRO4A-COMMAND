import { redirect } from "next/navigation"

import { InstallAppCard } from "@/components/pwa/install-app-card"
import { AccessTokenCard } from "@/components/settings/access-token-card"
import { ThemeSettingsCard } from "@/components/settings/theme-settings-card"
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

  if (!session) {
    redirect("/login")
  }

  const canManageTokens = isSuperAdmin(session.role)

  let tokens: AccessTokenListItem[] = []
  let tokenError: string | null = null

  if (canManageTokens) {
    try {
      tokens = await listAccessTokens()
    } catch (error) {
      tokenError =
        error instanceof Error
          ? error.message
          : "Unable to load access tokens from Supabase."
    }
  }

  return (
      <div className="mx-auto max-w-2xl space-y-4">
        <ThemeSettingsCard />

        <InstallAppCard />

        {canManageTokens ? (
          tokenError ? (
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
          )
        ) : null}
      </div>
  )
}
