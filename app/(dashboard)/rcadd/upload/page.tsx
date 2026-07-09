import { redirect } from "next/navigation"

import { RcaddUploadCard } from "@/components/settings/rcadd-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestRcaddUploadBatch } from "@/lib/rcadd-accomplishment-records"
import type { RcaddUploadBatchInfo } from "@/lib/rcadd-accomplishment-types"

export const maxDuration = 300

export default async function RcaddUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rcadd")
  } catch {
    redirect("/rcadd")
  }

  let latestBatch: RcaddUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestRcaddUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load RCADD upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RCADD File Upload</CardTitle>
          <CardDescription>
            Upload ang RCADD ACCOMPLISHMENT FOR PRO 4A COMMAND DASHBOARD workbook para sa RSRI,
            mobilized barangays, drug cleared barangays, at Project L.A.K.A.S cards.
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
            <CardTitle>Upload RCADD Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <RcaddUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
