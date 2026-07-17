"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadRhsuWorkbookAction } from "@/app/(dashboard)/settings/actions"
import {
  UPLOAD_CARD_CLASS,
  UPLOAD_DROPZONE_CLASS,
  UPLOAD_EMPTY_STATE_CLASS,
  UPLOAD_STATUS_BOX_CLASS,
} from "@/components/settings/upload-card-styles"
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
import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import type { RhsuUploadBatchInfo } from "@/lib/rhsu-types"
import { formatServerActionError } from "@/lib/server-action-errors"
import { validateXlsxOrXlsmFile } from "@/lib/upload-file-validation"

export function RhsuUploadCard({
  latestBatch,
}: {
  latestBatch: RhsuUploadBatchInfo | null
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [batch, setBatch] = useState(latestBatch)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { isPending, openConfirmation, confirmDialog } = useUploadConfirmation({
    validateFile: validateXlsxOrXlsmFile,
    onUpload: async (file, { setProgress }) => {
      setProgress("Ina-upload at binabasa ang RHSU workbook...")
      const formData = new FormData()
      formData.set("file", file)

      const result = await uploadRhsuWorkbookAction(formData).catch((uploadError) => {
        throw new Error(
          formatServerActionError(uploadError, "Hindi ma-upload ang RHSU workbook."),
        )
      })

      setBatch(result.batch)
      setSuccess("Na-upload ang RHSU decals at PURCs workbook.")
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    },
  })

  function handleUpload() {
    const file = inputRef.current?.files?.[0]
    setError(null)
    setSuccess(null)

    if (!file) {
      setError("Pumili muna ng Excel file (.xlsx o .xlsm).")
      return
    }

    openConfirmation(file)
  }

  return (
    <>
      {confirmDialog}
      <Card className={UPLOAD_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheetIcon className="size-5 text-primary" />
            Upload RHSU Workbook
          </CardTitle>
          <CardDescription>
            Inaasahang sheets: DECALS 2026, Decals Status, at PURCs 2026.
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
              Wala pang na-upload na RHSU workbook.
            </p>
          )}

          <div className={UPLOAD_DROPZONE_CLASS}>
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Choose file (.xlsx / .xlsm)</span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12"
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
          {success ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
