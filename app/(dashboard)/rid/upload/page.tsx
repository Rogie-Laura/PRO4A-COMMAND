import { redirect } from "next/navigation"

import { IllegalDrugsUploadCard } from "@/components/settings/illegal-drugs-upload-card"
import { TerrorismThreatUploadCard } from "@/components/settings/terrorism-threat-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestIllegalDrugsUploadBatch } from "@/lib/illegal-drugs-records"
import { getLatestTerrorismThreatUploadBatch } from "@/lib/terrorism-threat-records"
import type { IllegalDrugsUploadBatchInfo } from "@/lib/illegal-drugs-types"
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
  let latestTerrorismThreatBatch: TerrorismThreatUploadBatchInfo | null = null
  let illegalDrugsUploadError: string | null = null
  let terrorismThreatUploadError: string | null = null

  try {
    latestIllegalDrugsBatch = await getLatestIllegalDrugsUploadBatch()
  } catch (error) {
    illegalDrugsUploadError =
      error instanceof Error ? error.message : "Unable to load illegal drugs upload status."
  }

  try {
    latestTerrorismThreatBatch = await getLatestTerrorismThreatUploadBatch()
  } catch (error) {
    terrorismThreatUploadError =
      error instanceof Error ? error.message : "Unable to load terrorism threat upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RID File Upload</CardTitle>
          <CardDescription>
            Upload ang ILLEGAL DRUGS.xlsx para sa HVI at SLI sa RID dashboard, at ang TERRORISM
            THREAT LEVEL.xlsx para sa PRO4A Status.
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
    </div>
  )
}
