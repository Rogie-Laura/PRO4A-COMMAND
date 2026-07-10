import { redirect } from "next/navigation"

import { EstablishmentUploadCard } from "@/components/settings/establishment-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestEstablishmentUploadBatch } from "@/lib/establishment-records"
import type { EstablishmentUploadBatchInfo } from "@/lib/establishment-types"

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

  let latestBatch: EstablishmentUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestEstablishmentUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load establishment upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">ROD File Upload</CardTitle>
          <CardDescription>
            Upload ang PRO 4A ESTABLISHMENT workbook para sa establishment type cards sa Police
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
            <CardTitle>Upload Establishments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <EstablishmentUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
