import { redirect } from "next/navigation"

import { DrugClearingUploadCard } from "@/components/settings/drug-clearing-upload-card"
import { RcaddUploadCard } from "@/components/settings/rcadd-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestDrugClearingUploadBatch } from "@/lib/drug-clearing-records"
import type { DrugClearingUploadBatchInfo } from "@/lib/drug-clearing-types"
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
  let latestDrugClearingBatch: DrugClearingUploadBatchInfo | null = null
  let drugClearingUploadError: string | null = null

  try {
    latestBatch = await getLatestRcaddUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load RCADD upload status."
  }

  try {
    latestDrugClearingBatch = await getLatestDrugClearingUploadBatch()
  } catch (error) {
    drugClearingUploadError =
      error instanceof Error ? error.message : "Unable to load drug clearing upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RCADD File Upload</CardTitle>
          <CardDescription>
            Upload ang RCADD accomplishment workbook at drug_clearing.xlsx para sa RSRI,
            mobilized barangays, Project L.A.K.A.S, at Drug Clearing dashboard.
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

      {drugClearingUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Drug Clearing Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{drugClearingUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <DrugClearingUploadCard latestBatch={latestDrugClearingBatch} compact />
      )}
    </div>
  )
}
