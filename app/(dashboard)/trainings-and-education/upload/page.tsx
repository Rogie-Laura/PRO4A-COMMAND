import { redirect } from "next/navigation"

import { TrainingsUploadCard } from "@/components/settings/trainings-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestTrainingsUploadBatch } from "@/lib/trainings-records"
import type { TrainingsUploadBatchInfo } from "@/lib/trainings-types"

export const maxDuration = 300

export default async function RetdUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("retd")
  } catch {
    redirect("/trainings-and-education")
  }

  let latestBatch: TrainingsUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestTrainingsUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load RTAP upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RETD File Upload</CardTitle>
          <CardDescription>
            Upload ang RTAP 2026 - ACCOMPLISHMENT MONITORING workbook (4th UPDATED DET sheet) para
            sa Trainings and Education dashboard.
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
            <CardTitle>Upload RTAP Accomplishment Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <TrainingsUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
