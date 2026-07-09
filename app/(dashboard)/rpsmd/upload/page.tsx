import { redirect } from "next/navigation"

import { UperUploadCard } from "@/components/settings/uper-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestUperUploadBatch } from "@/lib/uper-records"
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

  try {
    latestBatch = await getLatestUperUploadBatch()
  } catch (error) {
    uploadError = error instanceof Error ? error.message : "Unable to load UPER upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RPSMD File Upload</CardTitle>
          <CardDescription>
            Upload ang PRO 4A UPER from DPL workbook para sa Current Ranking at monthly trend sa
            RPSMD dashboard.
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
            <CardTitle>Upload UPER Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <UperUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
