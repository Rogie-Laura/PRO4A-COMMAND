import { redirect } from "next/navigation"

import { RcdUploadCard } from "@/components/settings/rcd-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestRcdUploadBatch } from "@/lib/rcd-records"
import type { RcdUploadBatchInfo } from "@/lib/rcd-types"

export const maxDuration = 120

export default async function RcdUploadPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  try {
    await requireDivisionUploadSession("rcd")
  } catch {
    redirect("/rcd")
  }

  let latestBatch: RcdUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestRcdUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load RCD upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RCD File Upload</CardTitle>
          <CardDescription>
            Upload the compulsory retirees workbook to update the RCD page.
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
          <CardContent className="py-5 text-sm text-destructive">{uploadError}</CardContent>
        </Card>
      ) : (
        <RcdUploadCard latestBatch={latestBatch} />
      )}
    </div>
  )
}
