import { redirect } from "next/navigation"

import { AdminHoldingUploadCard } from "@/components/settings/admin-holding-upload-card"
import { RprmdWorkbookUploadCard } from "@/components/settings/rprmd-workbook-upload-card"
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
import { getLatestRprmdWorkbookUploadBatch } from "@/lib/rprmd-workbook-records"
import type { RprmdWorkbookUploadBatchInfo } from "@/lib/rprmd-workbook-types"

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

  let latestWorkbookBatch: RprmdWorkbookUploadBatchInfo | null = null
  let latestAdminHoldingBatch: AdminHoldingUploadBatchInfo | null = null
  let workbookUploadError: string | null = null
  let adminHoldingUploadError: string | null = null

  try {
    latestWorkbookBatch = await getLatestRprmdWorkbookUploadBatch()
  } catch (error) {
    workbookUploadError =
      error instanceof Error ? error.message : "Unable to load RPRMD workbook upload status."
  }

  try {
    latestAdminHoldingBatch = await getLatestAdminHoldingUploadBatch()
  } catch (error) {
    adminHoldingUploadError =
      error instanceof Error ? error.message : "Unable to load admin holding upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RPRMD File Upload</CardTitle>
          <CardDescription>
            Upload ang Alphalist workbook para sa personnel, schooling, at detailed sections. Ang
            Admin Holding ay hiwalay na RPHAS workbook upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.label}</span>
          </p>
        </CardContent>
      </Card>

      {workbookUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Alphalist Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{workbookUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <RprmdWorkbookUploadCard latestBatch={latestWorkbookBatch} compact />
      )}

      {adminHoldingUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Admin Holding Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{adminHoldingUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <AdminHoldingUploadCard latestBatch={latestAdminHoldingBatch} compact />
      )}
    </div>
  )
}
