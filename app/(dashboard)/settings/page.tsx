import { redirect } from "next/navigation"

import { InstallAppCard } from "@/components/pwa/install-app-card"
import { AccessTokenCard } from "@/components/settings/access-token-card"
import { BmiUploadCard } from "@/components/settings/bmi-upload-card"
import { CrimeUploadCard } from "@/components/settings/crime-upload-card"
import { FirearmsUploadCard } from "@/components/settings/firearms-upload-card"
import { MobilityUploadCard } from "@/components/settings/mobility-upload-card"
import { PpoUperUploadCard } from "@/components/settings/ppo-uper-upload-card"
import { LegislativeAgendaUploadCard } from "@/components/settings/legislative-agenda-upload-card"
import { StationClassificationUploadCard } from "@/components/settings/station-classification-upload-card"
import { TerrorismThreatUploadCard } from "@/components/settings/terrorism-threat-upload-card"
import { AlertLevelSettingsCard } from "@/components/settings/alert-level-settings-card"
import { RcaddUploadCard } from "@/components/settings/rcadd-upload-card"
import { EstablishmentUploadCard } from "@/components/settings/establishment-upload-card"
import { ThemeSettingsCard } from "@/components/settings/theme-settings-card"
import { UperUploadCard } from "@/components/settings/uper-upload-card"
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
import { getLatestMobilityUploadBatch } from "@/lib/mobility-records"
import type { MobilityUploadBatchInfo } from "@/lib/mobility-types"
import { getLatestPpoUperUploadBatch } from "@/lib/ppo-uper-records"
import type { PpoUperUploadBatchInfo } from "@/lib/ppo-uper-types"
import { getLatestLegislativeAgendaUploadBatch } from "@/lib/legislative-agenda-records"
import type { LegislativeAgendaUploadBatchInfo } from "@/lib/legislative-agenda-types"
import { getLatestStationClassificationUploadBatch } from "@/lib/station-classification-records"
import type { StationClassificationUploadBatchInfo } from "@/lib/station-classification-types"
import { getLatestTerrorismThreatUploadBatch } from "@/lib/terrorism-threat-records"
import type { TerrorismThreatUploadBatchInfo } from "@/lib/terrorism-threat-types"
import { getLatestRcaddUploadBatch } from "@/lib/rcadd-accomplishment-records"
import type { RcaddUploadBatchInfo } from "@/lib/rcadd-accomplishment-types"
import { getLatestEstablishmentUploadBatch } from "@/lib/establishment-records"
import type { EstablishmentUploadBatchInfo } from "@/lib/establishment-types"
import { getLatestUperUploadBatch } from "@/lib/uper-records"
import type { UperUploadBatchInfo } from "@/lib/uper-types"
import { canManageAlertLevel } from "@/lib/alert-level-access"
import { getAlertLevelSetting } from "@/lib/alert-level-records"
import type { AlertLevelId } from "@/lib/alert-level-types"

export const maxDuration = 300

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const canManageTokens = isSuperAdmin(session.role)
  const isDivisionFocal = session.role === "division_uploader"
  const showAlertLevelSettings = canManageAlertLevel(session)

  let tokens: AccessTokenListItem[] = []
  let tokenError: string | null = null
  let latestBmiBatch: BmiUploadBatchInfo | null = null
  let bmiUploadError: string | null = null
  let latestCrimeBatch: CrimeUploadBatchInfo | null = null
  let crimeUploadError: string | null = null
  let latestFirearmsBatch: FirearmsUploadBatchInfo | null = null
  let firearmsUploadError: string | null = null
  let latestMobilityBatch: MobilityUploadBatchInfo | null = null
  let mobilityUploadError: string | null = null
  let latestUperBatch: UperUploadBatchInfo | null = null
  let uperUploadError: string | null = null
  let latestPpoUperBatch: PpoUperUploadBatchInfo | null = null
  let ppoUperUploadError: string | null = null
  let latestStationClassificationBatch: StationClassificationUploadBatchInfo | null = null
  let stationClassificationUploadError: string | null = null
  let latestLegislativeAgendaBatch: LegislativeAgendaUploadBatchInfo | null = null
  let legislativeAgendaUploadError: string | null = null
  let latestTerrorismThreatBatch: TerrorismThreatUploadBatchInfo | null = null
  let terrorismThreatUploadError: string | null = null
  let latestRcaddBatch: RcaddUploadBatchInfo | null = null
  let rcaddUploadError: string | null = null
  let latestEstablishmentBatch: EstablishmentUploadBatchInfo | null = null
  let establishmentUploadError: string | null = null
  let alertLevel: AlertLevelId = "normal"
  let alertLevelError: string | null = null

  if (showAlertLevelSettings) {
    try {
      const setting = await getAlertLevelSetting()
      alertLevel = setting.level
    } catch (error) {
      alertLevelError =
        error instanceof Error
          ? error.message
          : "Unable to load alert level settings from Supabase."
    }
  }

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

    try {
      latestMobilityBatch = await getLatestMobilityUploadBatch()
    } catch (error) {
      mobilityUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load mobility upload status from Supabase."
    }

    try {
      latestUperBatch = await getLatestUperUploadBatch()
    } catch (error) {
      uperUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load UPER upload status from Supabase."
    }

    try {
      latestPpoUperBatch = await getLatestPpoUperUploadBatch()
    } catch (error) {
      ppoUperUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load PPO UPER upload status from Supabase."
    }

    try {
      latestStationClassificationBatch = await getLatestStationClassificationUploadBatch()
    } catch (error) {
      stationClassificationUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load station classification upload status from Supabase."
    }

    try {
      latestLegislativeAgendaBatch = await getLatestLegislativeAgendaUploadBatch()
    } catch (error) {
      legislativeAgendaUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load legislative agenda upload status from Supabase."
    }

    try {
      latestTerrorismThreatBatch = await getLatestTerrorismThreatUploadBatch()
    } catch (error) {
      terrorismThreatUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load terrorism threat upload status from Supabase."
    }

    try {
      latestRcaddBatch = await getLatestRcaddUploadBatch()
    } catch (error) {
      rcaddUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load RCADD upload status from Supabase."
    }

    try {
      latestEstablishmentBatch = await getLatestEstablishmentUploadBatch()
    } catch (error) {
      establishmentUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load establishment upload status from Supabase."
    }
  }

  return (
      <div className="mx-auto max-w-2xl space-y-4">
        <ThemeSettingsCard />

        {!isDivisionFocal ? <InstallAppCard /> : null}

        {showAlertLevelSettings ? (
          alertLevelError ? (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle>Alert Level</CardTitle>
                <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive">{alertLevelError}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  I-run muna ang Supabase migration `20260710180000_create_pro4a_alert_level_settings.sql`
                  kung wala pa ang `pro4a_alert_level_settings` table.
                </p>
              </CardContent>
            </Card>
          ) : (
            <AlertLevelSettingsCard initialLevel={alertLevel} />
          )
        ) : null}

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

            {mobilityUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Vehicle Clearbook</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{mobilityUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260702140000_create_mobility_upload_batches.sql`
                    kung wala pa ang `mobility_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <MobilityUploadCard latestBatch={latestMobilityBatch} />
            )}

            {uperUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload UPER Workbook</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{uperUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260709140000_create_uper_upload_batches.sql`
                    kung wala pa ang `uper_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <UperUploadCard latestBatch={latestUperBatch} />
            )}

            {ppoUperUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload UPER of PPOs</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{ppoUperUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260709150000_create_ppo_uper_upload_batches.sql`
                    kung wala pa ang `ppo_uper_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <PpoUperUploadCard latestBatch={latestPpoUperBatch} />
            )}

            {stationClassificationUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Classification of Stations</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{stationClassificationUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260709160000_create_station_classification_upload_batches.sql`
                    kung wala pa ang `station_classification_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StationClassificationUploadCard latestBatch={latestStationClassificationBatch} />
            )}

            {legislativeAgendaUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Legislative Agenda</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{legislativeAgendaUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260709170000_create_legislative_agenda_upload_batches.sql`
                    kung wala pa ang `legislative_agenda_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <LegislativeAgendaUploadCard latestBatch={latestLegislativeAgendaBatch} />
            )}

            {terrorismThreatUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload R2 Workbook (Terrorism Threat)</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{terrorismThreatUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260709180000_create_terrorism_threat_upload_batches.sql`
                    kung wala pa ang `terrorism_threat_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <TerrorismThreatUploadCard latestBatch={latestTerrorismThreatBatch} />
            )}

            {rcaddUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload RCADD Workbook</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{rcaddUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260710140000_create_rcadd_accomplishment_upload_batches.sql`
                    kung wala pa ang `rcadd_accomplishment_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <RcaddUploadCard latestBatch={latestRcaddBatch} />
            )}

            {establishmentUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Establishments</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{establishmentUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260710160000_create_establishments.sql`
                    kung wala pa ang `establishments` tables.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <EstablishmentUploadCard latestBatch={latestEstablishmentBatch} />
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
