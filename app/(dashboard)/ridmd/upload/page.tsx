import { redirect } from "next/navigation"

import { CrimeUploadCard } from "@/components/settings/crime-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestCrimeUploadBatch, type CrimeUploadBatchInfo } from "@/lib/crime-records"

export const maxDuration = 300

export default async function RidmdUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("ridmd")
  } catch {
    redirect("/ridmd")
  }

  let latestBatch: CrimeUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestCrimeUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load crime upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RIDMD Crime Stats Upload</CardTitle>
          <CardDescription>
            Upload ang PNP-CRAS export (CRAS-112) para sa index crime analytics sa RIDMD dashboard.
            INDEX crimes lang mula 2026 pataas ang kukunin.
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
            <CardTitle>Upload Crime Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <CrimeUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
