"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadStationClassificationWorkbookAction } from "@/app/(dashboard)/settings/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  UPLOAD_CARD_CLASS,
  UPLOAD_DROPZONE_CLASS,
  UPLOAD_EMPTY_STATE_CLASS,
  UPLOAD_STATUS_BOX_CLASS,
} from "@/components/settings/upload-card-styles"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import { formatServerActionError } from "@/lib/server-action-errors"
import type { StationClassificationUploadBatchInfo } from "@/lib/station-classification-types"
import { cn } from "@/lib/utils"

type StationClassificationUploadCardProps = {
  latestBatch: StationClassificationUploadBatchInfo | null
  compact?: boolean
}

export function StationClassificationUploadCard({
  latestBatch,
  compact = false,
}: StationClassificationUploadCardProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [batch, setBatch] = useState(latestBatch)
  const [isPending, startTransition] = useTransition()

  function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    setError(null)
    setSuccess(null)

    if (!file) {
      setError("Pumili muna ng Excel file (.xlsx).")
      return
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Excel (.xlsx) lang ang tinatanggap. Gamitin ang R9 Classification of Stations workbook.")
      return
    }

    const formData = new FormData()
    formData.set("file", file)

    startTransition(async () => {
      try {
        const result = await uploadStationClassificationWorkbookAction(formData)
        setBatch(result.batch)
        setSuccess("Na-upload ang Classification of Stations workbook.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        router.refresh()
      } catch (uploadError) {
        setError(
          formatServerActionError(uploadError, "Hindi ma-upload ang station classification workbook."),
        )
      }
    })
  }

  return (
    <Card className={cn(UPLOAD_CARD_CLASS, compact && "shadow-sm")}>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-5 text-primary" />
          Upload Classification of Stations
        </CardTitle>
        <CardDescription>
          Excel workbook na may Station Classification summary at linked sheets para sa CCPS, MPS A,
          MPS B, MPS C, at PMFC.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch ? (
          <div className={UPLOAD_STATUS_BOX_CLASS}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">Latest upload</p>
              <Badge variant="outline">{batch.filename}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {batch.uploadedByLabel ? `${batch.uploadedByLabel} · ` : ""}
              {formatPhilippinesDateTime(batch.createdAt)}
            </p>
          </div>
        ) : (
          <p className={UPLOAD_EMPTY_STATE_CLASS}>
            Wala pang na-upload na classification workbook. Pumili ng R9 Classification of
            Stations.xlsx sa ibaba.
          </p>
        )}

        <div className={UPLOAD_DROPZONE_CLASS}>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Choose file (.xlsx)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={isPending}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </label>

          <Button onClick={handleUpload} disabled={isPending} className="w-full sm:w-auto">
            <UploadIcon />
            {isPending ? "Ina-upload..." : "Upload to Supabase"}
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}
      </CardContent>
    </Card>
  )
}
