"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadIllegalDrugsWorkbookAction } from "@/app/(dashboard)/settings/actions"
import { useUploadConfirmation } from "@/components/settings/use-upload-confirmation"
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
import type { IllegalDrugsUploadBatchInfo } from "@/lib/illegal-drugs-types"
import { validateXlsxFile } from "@/lib/upload-file-validation"
import { cn } from "@/lib/utils"

type IllegalDrugsUploadCardProps = {
  latestBatch: IllegalDrugsUploadBatchInfo | null
  compact?: boolean
}

export function IllegalDrugsUploadCard({
  latestBatch,
  compact = false,
}: IllegalDrugsUploadCardProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [batch, setBatch] = useState(latestBatch)

  const { isPending, openConfirmation, confirmDialog } = useUploadConfirmation({
    validateFile: validateXlsxFile,
    onUpload: async (file, { setProgress }) => {
      setProgress("Ina-upload ang ILLEGAL DRUGS workbook...")
      const formData = new FormData()
      formData.set("file", file)
      const result = await uploadIllegalDrugsWorkbookAction(formData).catch((uploadError) => {
        throw new Error(formatServerActionError(uploadError, "Hindi ma-upload ang illegal drugs workbook."))
      })
      setBatch(result.batch)
      setSuccess("Na-upload ang ILLEGAL DRUGS workbook.")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      router.refresh()
    },
  })

  function handleUploadClick() {
    const file = fileInputRef.current?.files?.[0]
    setError(null)
    setSuccess(null)

    if (!file) {
      setError("Pumili muna ng Excel file (.xlsx).")
      return
    }

    openConfirmation(file)
  }

  return (
    <>
      {confirmDialog}
      <Card className={cn(UPLOAD_CARD_CLASS, compact && "shadow-sm")}>
        <CardHeader className={compact ? "pb-3" : undefined}>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheetIcon className="size-5 text-primary" />
            Upload Illegal Drugs
          </CardTitle>
          <CardDescription>
            ILLEGAL DRUGS.xlsx — HVI at SLI summary tables.
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
              Wala pang na-upload na illegal drugs file. Pumili ng ILLEGAL DRUGS.xlsx sa ibaba.
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

            <Button onClick={handleUploadClick} disabled={isPending} className="w-full sm:w-auto">
              <UploadIcon />
              {isPending ? "Ina-upload..." : "Upload to Supabase"}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}
        </CardContent>
      </Card>
    </>
  )
}
