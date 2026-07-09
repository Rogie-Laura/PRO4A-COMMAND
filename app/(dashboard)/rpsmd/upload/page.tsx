import { redirect } from "next/navigation"

import { LegislativeAgendaUploadCard } from "@/components/settings/legislative-agenda-upload-card"
import { PpoUperUploadCard } from "@/components/settings/ppo-uper-upload-card"
import { StationClassificationUploadCard } from "@/components/settings/station-classification-upload-card"
import { UperUploadCard } from "@/components/settings/uper-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestLegislativeAgendaUploadBatch } from "@/lib/legislative-agenda-records"
import { getLatestPpoUperUploadBatch } from "@/lib/ppo-uper-records"
import { getLatestStationClassificationUploadBatch } from "@/lib/station-classification-records"
import { getLatestUperUploadBatch } from "@/lib/uper-records"
import type { LegislativeAgendaUploadBatchInfo } from "@/lib/legislative-agenda-types"
import type { PpoUperUploadBatchInfo } from "@/lib/ppo-uper-types"
import type { StationClassificationUploadBatchInfo } from "@/lib/station-classification-types"
import type { UperUploadBatchInfo } from "@/lib/uper-types"

export const maxDuration = 300

export default async function RpsmdUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rpsmd")
  } catch {
    redirect("/rpsmd")
  }

  let latestBatch: UperUploadBatchInfo | null = null
  let uploadError: string | null = null
  let latestPpoBatch: PpoUperUploadBatchInfo | null = null
  let ppoUploadError: string | null = null
  let latestStationBatch: StationClassificationUploadBatchInfo | null = null
  let stationUploadError: string | null = null
  let latestLegislativeBatch: LegislativeAgendaUploadBatchInfo | null = null
  let legislativeUploadError: string | null = null

  try {
    latestBatch = await getLatestUperUploadBatch()
  } catch (error) {
    uploadError = error instanceof Error ? error.message : "Unable to load UPER upload status."
  }

  try {
    latestPpoBatch = await getLatestPpoUperUploadBatch()
  } catch (error) {
    ppoUploadError =
      error instanceof Error ? error.message : "Unable to load PPO UPER upload status."
  }

  try {
    latestStationBatch = await getLatestStationClassificationUploadBatch()
  } catch (error) {
    stationUploadError =
      error instanceof Error ? error.message : "Unable to load station classification upload status."
  }

  try {
    latestLegislativeBatch = await getLatestLegislativeAgendaUploadBatch()
  } catch (error) {
    legislativeUploadError =
      error instanceof Error ? error.message : "Unable to load legislative agenda upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RPSMD File Upload</CardTitle>
          <CardDescription>
            Upload ang PRO 4A UPER, UPER of PPOs, Classification of Stations, at Legislative Agenda
            workbooks para sa RPSMD dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.label}</span>
          </p>
        </CardContent>
      </Card>

      {uploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload PRO 4A UPER</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <UperUploadCard latestBatch={latestBatch} compact />
      )}

      {ppoUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload UPER of PPOs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{ppoUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <PpoUperUploadCard latestBatch={latestPpoBatch} compact />
      )}

      {stationUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Classification of Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{stationUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <StationClassificationUploadCard latestBatch={latestStationBatch} compact />
      )}

      {legislativeUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Legislative Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{legislativeUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <LegislativeAgendaUploadCard latestBatch={latestLegislativeBatch} compact />
      )}
    </div>
  )
}
