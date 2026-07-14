import { redirect } from "next/navigation"

import { IctEquipmentUploadCard } from "@/components/settings/ict-equipment-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestIctEquipmentUploadBatch } from "@/lib/ict-equipment-records"
import type { IctEquipmentUploadBatchInfo } from "@/lib/ict-equipment-types"

export const maxDuration = 300

export default async function RictmdUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rictmd")
  } catch {
    redirect("/ict-equipment-inventory")
  }

  let latestBatch: IctEquipmentUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestIctEquipmentUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load ICT equipment upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RICTMD File Upload</CardTitle>
          <CardDescription>
            Upload ang Inventory of Devices workbook (RECAP sheet, row 18+) para sa ICT Equipment
            Inventory dashboard.
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
            <CardTitle>Upload ICT Inventory Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{uploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <IctEquipmentUploadCard latestBatch={latestBatch} compact />
      )}
    </div>
  )
}
