import { redirect } from "next/navigation"

import { CriminalGangsUploadCard } from "@/components/settings/criminal-gangs-upload-card"
import { ForeignNationalUploadCard } from "@/components/settings/foreign-national-upload-card"
import { IllegalDrugsUploadCard } from "@/components/settings/illegal-drugs-upload-card"
import { SurrenderedCtgfUploadCard } from "@/components/settings/surrendered-ctgf-upload-card"
import { TerrorismThreatUploadCard } from "@/components/settings/terrorism-threat-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestCriminalGangsUploadBatch } from "@/lib/criminal-gangs-records"
import { getLatestForeignNationalUploadBatch } from "@/lib/foreign-national-records"
import { getLatestIllegalDrugsUploadBatch } from "@/lib/illegal-drugs-records"
import { getLatestSurrenderedCtgfUploadBatch } from "@/lib/surrendered-ctgf-records"
import { getLatestTerrorismThreatUploadBatch } from "@/lib/terrorism-threat-records"
import type { CriminalGangsUploadBatchInfo } from "@/lib/criminal-gangs-types"
import type { ForeignNationalUploadBatchInfo } from "@/lib/foreign-national-types"
import type { IllegalDrugsUploadBatchInfo } from "@/lib/illegal-drugs-types"
import type { SurrenderedCtgfUploadBatchInfo } from "@/lib/surrendered-ctgf-types"
import type { TerrorismThreatUploadBatchInfo } from "@/lib/terrorism-threat-types"

export const maxDuration = 300

export default async function RidUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rid")
  } catch {
    redirect("/rid")
  }

  let latestIllegalDrugsBatch: IllegalDrugsUploadBatchInfo | null = null
  let latestCriminalGangsBatch: CriminalGangsUploadBatchInfo | null = null
  let latestSurrenderedCtgfBatch: SurrenderedCtgfUploadBatchInfo | null = null
  let latestTerrorismThreatBatch: TerrorismThreatUploadBatchInfo | null = null
  let latestForeignNationalBatch: ForeignNationalUploadBatchInfo | null = null
  let illegalDrugsUploadError: string | null = null
  let criminalGangsUploadError: string | null = null
  let surrenderedCtgfUploadError: string | null = null
  let terrorismThreatUploadError: string | null = null
  let foreignNationalUploadError: string | null = null

  try {
    latestIllegalDrugsBatch = await getLatestIllegalDrugsUploadBatch()
  } catch (error) {
    illegalDrugsUploadError =
      error instanceof Error ? error.message : "Unable to load illegal drugs upload status."
  }

  try {
    latestCriminalGangsBatch = await getLatestCriminalGangsUploadBatch()
  } catch (error) {
    criminalGangsUploadError =
      error instanceof Error ? error.message : "Unable to load criminal gangs upload status."
  }

  try {
    latestSurrenderedCtgfBatch = await getLatestSurrenderedCtgfUploadBatch()
  } catch (error) {
    surrenderedCtgfUploadError =
      error instanceof Error ? error.message : "Unable to load surrendered CTGs upload status."
  }

  try {
    latestTerrorismThreatBatch = await getLatestTerrorismThreatUploadBatch()
  } catch (error) {
    terrorismThreatUploadError =
      error instanceof Error ? error.message : "Unable to load terrorism threat upload status."
  }

  try {
    latestForeignNationalBatch = await getLatestForeignNationalUploadBatch()
  } catch (error) {
    foreignNationalUploadError =
      error instanceof Error ? error.message : "Unable to load foreign national upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RID File Upload</CardTitle>
          <CardDescription>
            Upload ang ILLEGAL DRUGS.xlsx, ACCOMPLISHMENTS ON CRIMINAL GANGS.xlsx, SURRENDERED
            CTGs AND FAs.xlsx, Incident Report Involving Foreign National.xlsx, at TERRORISM THREAT
            LEVEL.xlsx.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.label}</span>
          </p>
        </CardContent>
      </Card>

      {illegalDrugsUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Illegal Drugs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{illegalDrugsUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <IllegalDrugsUploadCard latestBatch={latestIllegalDrugsBatch} compact />
      )}

      {criminalGangsUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Criminal Gangs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{criminalGangsUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <CriminalGangsUploadCard latestBatch={latestCriminalGangsBatch} compact />
      )}

      {surrenderedCtgfUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Surrendered CTGs and FAs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{surrenderedCtgfUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <SurrenderedCtgfUploadCard latestBatch={latestSurrenderedCtgfBatch} compact />
      )}

      {terrorismThreatUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Threat Level File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{terrorismThreatUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <TerrorismThreatUploadCard latestBatch={latestTerrorismThreatBatch} compact />
      )}

      {foreignNationalUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Foreign National Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{foreignNationalUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <ForeignNationalUploadCard latestBatch={latestForeignNationalBatch} compact />
      )}
    </div>
  )
}
