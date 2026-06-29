import { redirect } from "next/navigation"

import { InstallAppCard } from "@/components/pwa/install-app-card"
import { AccessTokenCard } from "@/components/settings/access-token-card"
import { BmiUploadCard } from "@/components/settings/bmi-upload-card"
import { CrimeUploadCard } from "@/components/settings/crime-upload-card"
import { FirearmsUploadCard } from "@/components/settings/firearms-upload-card"
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
import { getLatestBmiUploadBatch, type BmiUploadBatchInfo } from "@/lib/bmi-records"
import { getLatestCrimeUploadBatch, type CrimeUploadBatchInfo } from "@/lib/crime-records"
import {
  getLatestFirearmsUploadBatch,
} from "@/lib/firearms-records"
import type { FirearmsUploadBatchInfo } from "@/lib/firearms-types"

export const maxDuration = 300

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const canManageTokens = isSuperAdmin(session.role)

  let tokens: AccessTokenListItem[] = []
  let tokenError: string | null = null
  let latestBmiBatch: BmiUploadBatchInfo | null = null
  let bmiUploadError: string | null = null
  let latestCrimeBatch: CrimeUploadBatchInfo | null = null
  let crimeUploadError: string | null = null
  let latestFirearmsBatch: FirearmsUploadBatchInfo | null = null
  let firearmsUploadError: string | null = null

  if (canManageTokens) {
    try {
      tokens = await listAccessTokens()
    } catch (error) {
      tokenError =
        error instanceof Error
          ? error.message
          : "Unable to load access tokens from Supabase."
    }

    try {
      latestBmiBatch = await getLatestBmiUploadBatch()
    } catch (error) {
      bmiUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load BMI upload status from Supabase."
    }

    try {
      latestCrimeBatch = await getLatestCrimeUploadBatch()
    } catch (error) {
      crimeUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load crime upload status from Supabase."
    }

    try {
      latestFirearmsBatch = await getLatestFirearmsUploadBatch()
    } catch (error) {
      firearmsUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load firearms upload status from Supabase."
    }
  }

  return (
      <div className="mx-auto max-w-2xl space-y-4">
        <ThemeSettingsCard />

        <InstallAppCard />

        {canManageTokens ? (
          <>
            {bmiUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload BMI Records</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{bmiUploadError}</p>
                </CardContent>
              </Card>
            ) : (
              <BmiUploadCard latestBatch={latestBmiBatch} />
            )}

            {crimeUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Crime Stats</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{crimeUploadError}</p>
                </CardContent>
              </Card>
            ) : (
              <CrimeUploadCard latestBatch={latestCrimeBatch} />
            )}

            {firearmsUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Firearms Summary</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{firearmsUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260701140000_create_firearms_upload_batches.sql`
                    kung wala pa ang `firearms_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <FirearmsUploadCard latestBatch={latestFirearmsBatch} />
            )}

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
          </>
        ) : null}
      </div>
  )
}
