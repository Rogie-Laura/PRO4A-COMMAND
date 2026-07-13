import { redirect } from "next/navigation"

import { AdminHoldingUploadCard } from "@/components/settings/admin-holding-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestAdminHoldingUploadBatch } from "@/lib/admin-holding-records"
import type { AdminHoldingUploadBatchInfo } from "@/lib/admin-holding-types"

export const maxDuration = 300

export default async function RprmdUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rprmd")
  } catch {
    redirect("/rprmd")
  }

  let latestBatch: AdminHoldingUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestAdminHoldingUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load admin holding upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RPRMD File Upload</CardTitle>
          <CardDescription>
            Upload ang RPHAS workbook (Admin Holding sheet) para sa admin holdings section sa
            RPRMD dashboard.
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
            <CardTitle>Upload Admin Holding Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <AdminHoldingUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
