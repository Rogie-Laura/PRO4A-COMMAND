import { redirect } from "next/navigation"

import { FirearmsUploadCard } from "@/components/settings/firearms-upload-card"
import { MobilityUploadCard } from "@/components/settings/mobility-upload-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession, requireDivisionUploadSession } from "@/lib/auth/get-session"
import { getLatestFirearmsUploadBatch } from "@/lib/firearms-records"
import type { FirearmsUploadBatchInfo } from "@/lib/firearms-types"
import { getLatestMobilityUploadBatch } from "@/lib/mobility-records"
import type { MobilityUploadBatchInfo } from "@/lib/mobility-types"

export const maxDuration = 300

export default async function RlrddUploadPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    await requireDivisionUploadSession("rlrdd")
  } catch {
    redirect("/rlrdd")
  }

  let latestFirearmsBatch: FirearmsUploadBatchInfo | null = null
  let firearmsUploadError: string | null = null
  let latestMobilityBatch: MobilityUploadBatchInfo | null = null
  let mobilityUploadError: string | null = null

  try {
    latestFirearmsBatch = await getLatestFirearmsUploadBatch()
  } catch (error) {
    firearmsUploadError =
      error instanceof Error ? error.message : "Unable to load firearms upload status."
  }

  try {
    latestMobilityBatch = await getLatestMobilityUploadBatch()
  } catch (error) {
    mobilityUploadError =
      error instanceof Error ? error.message : "Unable to load mobility upload status."
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">RLRDD File Upload</CardTitle>
          <CardDescription>
            Upload Firearms Summary at Vehicle Clearbook Excel files para sa RLRDD dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.label}</span>
          </p>
        </CardContent>
      </Card>

      {firearmsUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Firearms Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{firearmsUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <FirearmsUploadCard latestBatch={latestFirearmsBatch} compact />
      )}

      {mobilityUploadError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Upload Vehicle Clearbook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{mobilityUploadError}</p>
          </CardContent>
        </Card>
      ) : (
        <MobilityUploadCard latestBatch={latestMobilityBatch} />
      )}
    </div>
  )
}
