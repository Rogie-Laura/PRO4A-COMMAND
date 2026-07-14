import { CheckCircle2Icon, CircleDashedIcon } from "lucide-react"

import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import { getLatestAdminHoldingUploadBatch } from "@/lib/admin-holding-records"
import { getLatestRprmdWorkbookUploadBatch } from "@/lib/rprmd-workbook-records"
import { cn } from "@/lib/utils"

type UploadStatusLineProps = {
  label: string
  uploadedAt: string | null
}

function UploadStatusLine({ label, uploadedAt }: UploadStatusLineProps) {
  const isUploaded = Boolean(uploadedAt)

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
      <span className="font-medium text-foreground">{label}:</span>
      {isUploaded ? (
        <>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2Icon className="size-3.5 shrink-0" aria-hidden />
            Uploaded
          </span>
          <span className="text-muted-foreground">{formatPhilippinesDateTime(uploadedAt!)}</span>
        </>
      ) : (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <CircleDashedIcon className="size-3.5 shrink-0" aria-hidden />
          Wala pang upload
        </span>
      )}
    </div>
  )
}

export async function RprmdUploadStatus() {
  const [personnelBatch, adminHoldingBatch] = await Promise.all([
    getLatestRprmdWorkbookUploadBatch().catch(() => null),
    getLatestAdminHoldingUploadBatch().catch(() => null),
  ])

  return (
    <div
      className={cn(
        "flex flex-col items-end gap-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-3",
        "sm:flex-row sm:flex-wrap sm:justify-end sm:gap-x-8 sm:gap-y-2",
      )}
    >
      <UploadStatusLine label="Personnel List" uploadedAt={personnelBatch?.createdAt ?? null} />
      <UploadStatusLine label="Admin Holdings" uploadedAt={adminHoldingBatch?.createdAt ?? null} />
    </div>
  )
}
