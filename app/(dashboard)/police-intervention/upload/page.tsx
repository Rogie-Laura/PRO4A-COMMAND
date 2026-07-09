import { redirect } from "next/navigation"

import { TerrorismThreatUploadCard } from "@/components/settings/terrorism-threat-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestTerrorismThreatUploadBatch } from "@/lib/terrorism-threat-records"
import type { TerrorismThreatUploadBatchInfo } from "@/lib/terrorism-threat-types"

export const maxDuration = 300

export default async function PoliceInterventionUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rod")
  } catch {
    redirect("/police-intervention")
  }

  let latestBatch: TerrorismThreatUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestTerrorismThreatUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load terrorism threat upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">ROD File Upload</CardTitle>
          <CardDescription>
            Upload ang R2 for PRO4A COMMAND workbook para sa Terrorism Threat Level sa Police
            Intervention dashboard.
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
            <CardTitle>Upload R2 Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <TerrorismThreatUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
