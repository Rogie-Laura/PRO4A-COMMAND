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
import { IllegalDrugsUploadCard } from "@/components/settings/illegal-drugs-upload-card"
import { CriminalGangsUploadCard } from "@/components/settings/criminal-gangs-upload-card"
import { SurrenderedCtgfUploadCard } from "@/components/settings/surrendered-ctgf-upload-card"
import { ForeignNationalUploadCard } from "@/components/settings/foreign-national-upload-card"
import { TrainingsUploadCard } from "@/components/settings/trainings-upload-card"
import { AdminHoldingUploadCard } from "@/components/settings/admin-holding-upload-card"
import { AlertLevelSettingsCard } from "@/components/settings/alert-level-settings-card"
import { DrugClearingUploadCard } from "@/components/settings/drug-clearing-upload-card"
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
import { getLatestIllegalDrugsUploadBatch } from "@/lib/illegal-drugs-records"
import type { IllegalDrugsUploadBatchInfo } from "@/lib/illegal-drugs-types"
import { getLatestCriminalGangsUploadBatch } from "@/lib/criminal-gangs-records"
import type { CriminalGangsUploadBatchInfo } from "@/lib/criminal-gangs-types"
import { getLatestSurrenderedCtgfUploadBatch } from "@/lib/surrendered-ctgf-records"
import type { SurrenderedCtgfUploadBatchInfo } from "@/lib/surrendered-ctgf-types"
import { getLatestForeignNationalUploadBatch } from "@/lib/foreign-national-records"
import type { ForeignNationalUploadBatchInfo } from "@/lib/foreign-national-types"
import { getLatestTrainingsUploadBatch } from "@/lib/trainings-records"
import type { TrainingsUploadBatchInfo } from "@/lib/trainings-types"
import { getLatestAdminHoldingUploadBatch } from "@/lib/admin-holding-records"
import type { AdminHoldingUploadBatchInfo } from "@/lib/admin-holding-types"
import { getLatestDrugClearingUploadBatch } from "@/lib/drug-clearing-records"
import type { DrugClearingUploadBatchInfo } from "@/lib/drug-clearing-types"
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
  let latestIllegalDrugsBatch: IllegalDrugsUploadBatchInfo | null = null
  let illegalDrugsUploadError: string | null = null
  let latestCriminalGangsBatch: CriminalGangsUploadBatchInfo | null = null
  let criminalGangsUploadError: string | null = null
  let latestSurrenderedCtgfBatch: SurrenderedCtgfUploadBatchInfo | null = null
  let surrenderedCtgfUploadError: string | null = null
  let latestForeignNationalBatch: ForeignNationalUploadBatchInfo | null = null
  let foreignNationalUploadError: string | null = null
  let latestTrainingsBatch: TrainingsUploadBatchInfo | null = null
  let trainingsUploadError: string | null = null
  let latestAdminHoldingBatch: AdminHoldingUploadBatchInfo | null = null
  let adminHoldingUploadError: string | null = null
  let latestRcaddBatch: RcaddUploadBatchInfo | null = null
  let rcaddUploadError: string | null = null
  let latestDrugClearingBatch: DrugClearingUploadBatchInfo | null = null
  let drugClearingUploadError: string | null = null
  let latestEstablishmentBatch: EstablishmentUploadBatchInfo | null = null
  let establishmentUploadError: string | null = null
  let alertLevel: AlertLevelId = "normal"
  let alertLevelRemarks: string | null = null
  let alertLevelError: string | null = null

  if (showAlertLevelSettings) {
    try {
      const setting = await getAlertLevelSetting()
      alertLevel = setting.level
      alertLevelRemarks = setting.remarks
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
      latestIllegalDrugsBatch = await getLatestIllegalDrugsUploadBatch()
    } catch (error) {
      illegalDrugsUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load illegal drugs upload status from Supabase."
    }

    try {
      latestCriminalGangsBatch = await getLatestCriminalGangsUploadBatch()
    } catch (error) {
      criminalGangsUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load criminal gangs upload status from Supabase."
    }

    try {
      latestSurrenderedCtgfBatch = await getLatestSurrenderedCtgfUploadBatch()
    } catch (error) {
      surrenderedCtgfUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load surrendered CTGs upload status from Supabase."
    }

    try {
      latestForeignNationalBatch = await getLatestForeignNationalUploadBatch()
    } catch (error) {
      foreignNationalUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load foreign national upload status from Supabase."
    }

    try {
      latestTrainingsBatch = await getLatestTrainingsUploadBatch()
    } catch (error) {
      trainingsUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load RTAP upload status from Supabase."
    }

    try {
      latestAdminHoldingBatch = await getLatestAdminHoldingUploadBatch()
    } catch (error) {
      adminHoldingUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load admin holding upload status from Supabase."
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
      latestDrugClearingBatch = await getLatestDrugClearingUploadBatch()
    } catch (error) {
      drugClearingUploadError =
        error instanceof Error
          ? error.message
          : "Unable to load drug clearing upload status from Supabase."
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
                  I-run muna ang Supabase migrations para sa `pro4a_alert_level_settings` table at
                  `remarks` column.
                </p>
              </CardContent>
            </Card>
          ) : (
            <AlertLevelSettingsCard
              initialLevel={alertLevel}
              initialRemarks={alertLevelRemarks}
            />
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

            {illegalDrugsUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Illegal Drugs</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{illegalDrugsUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260710190000_create_illegal_drugs_upload_batches.sql`
                    kung wala pa ang `illegal_drugs_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <IllegalDrugsUploadCard latestBatch={latestIllegalDrugsBatch} />
            )}

            {criminalGangsUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Criminal Gangs</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{criminalGangsUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260710194500_create_criminal_gangs_upload_batches.sql`
                    kung wala pa ang `criminal_gangs_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <CriminalGangsUploadCard latestBatch={latestCriminalGangsBatch} />
            )}

            {surrenderedCtgfUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Surrendered CTGs and FAs</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{surrenderedCtgfUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260710200000_create_surrendered_ctgf_upload_batches.sql`
                    kung wala pa ang `surrendered_ctgf_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <SurrenderedCtgfUploadCard latestBatch={latestSurrenderedCtgfBatch} />
            )}

            {foreignNationalUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Foreign National Incidents</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{foreignNationalUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260710210000_create_foreign_national_upload_batches.sql`
                    kung wala pa ang `foreign_national_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ForeignNationalUploadCard latestBatch={latestForeignNationalBatch} />
            )}

            {trainingsUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload RTAP Accomplishment Monitoring</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{trainingsUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260713120000_create_trainings_upload_batches.sql`
                    kung wala pa ang `trainings_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <TrainingsUploadCard latestBatch={latestTrainingsBatch} />
            )}

            {adminHoldingUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Admin Holding Workbook</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{adminHoldingUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260714120000_create_admin_holding_upload_batches.sql`
                    kung wala pa ang `admin_holding_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AdminHoldingUploadCard latestBatch={latestAdminHoldingBatch} />
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

            {drugClearingUploadError ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Upload Drug Clearing Workbook</CardTitle>
                  <CardDescription>Supabase PRO4A_COMMAND connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{drugClearingUploadError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    I-run muna ang Supabase migration `20260713220000_create_drug_clearing_upload_batches.sql`
                    kung wala pa ang `drug_clearing_upload_batches` table.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <DrugClearingUploadCard latestBatch={latestDrugClearingBatch} />
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
