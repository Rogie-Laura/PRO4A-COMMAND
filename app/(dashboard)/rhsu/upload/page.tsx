import { redirect } from "next/navigation"

import { RhsuUploadCard } from "@/components/settings/rhsu-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestRhsuUploadBatch } from "@/lib/rhsu-records"
import type { RhsuUploadBatchInfo } from "@/lib/rhsu-types"

export const maxDuration = 120

export default async function RhsuUploadPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  try {
    await requireDivisionUploadSession("rhsu")
  } catch {
    redirect("/rhsu")
  }

  let latestBatch: RhsuUploadBatchInfo | null = null
  let uploadError: string | null = null

  try {
    latestBatch = await getLatestRhsuUploadBatch()
  } catch (error) {
    uploadError =
      error instanceof Error ? error.message : "Unable to load RHSU upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RHSU File Upload</CardTitle>
          <CardDescription>
            Upload the official decals and PURCs workbook to update the RHSU statistics page.
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
        <RhsuUploadCard latestBatch={latestBatch} />
      )}
    </div>
  )
}
