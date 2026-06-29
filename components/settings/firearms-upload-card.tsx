"use client"

import { useRef, useState, useTransition } from "react"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadFirearmsWorkbookAction } from "@/app/(dashboard)/settings/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FirearmsUploadBatchInfo } from "@/lib/firearms-types"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"

type FirearmsUploadCardProps = {
  latestBatch: FirearmsUploadBatchInfo | null
}

export function FirearmsUploadCard({ latestBatch }: FirearmsUploadCardProps) {
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
      setError("Excel (.xlsx) lang ang tinatanggap. Gamitin ang firearms.xlsx template.")
      return
    }

    const formData = new FormData()
    formData.set("file", file)

    startTransition(async () => {
      try {
        const result = await uploadFirearmsWorkbookAction(formData)
        setBatch(result.batch)
        setSuccess("Na-upload ang firearms summary sa Supabase.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Hindi ma-upload ang firearms workbook.",
        )
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-4" />
          Upload Firearms Summary
        </CardTitle>
        <CardDescription>
          Excel workbook na may `SHORT FIREARMS` at `LONG FIREARMS` worksheets (firearms.xlsx).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch ? (
          <div className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Latest upload</Badge>
              <span className="font-medium">{batch.filename}</span>
            </div>
            <p className="mt-2 text-muted-foreground">
              {formatPhilippinesDateTime(batch.createdAt)}
              {batch.uploadedByLabel ? ` · ${batch.uploadedByLabel}` : ""}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Walang na-upload na firearms workbook pa.</p>
        )}

        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept=".xlsx" className="block w-full text-sm" />
          <Button type="button" onClick={handleUpload} disabled={isPending} className="w-full">
            <UploadIcon className="size-4" />
            {isPending ? "Ina-upload..." : "Upload firearms.xlsx"}
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}
      </CardContent>
    </Card>
  )
}
