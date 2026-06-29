"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
  compact?: boolean
}

export function FirearmsUploadCard({ latestBatch, compact = false }: FirearmsUploadCardProps) {
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
        router.refresh()
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
    <Card className={compact ? "border-primary/25 bg-primary/5" : undefined}>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-5 text-primary" />
          Upload Firearms Summary
        </CardTitle>
        <CardDescription>
          Super Admin lang. Excel workbook na may `SHORT FIREARMS` at `LONG FIREARMS` worksheets
          (firearms.xlsx).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch ? (
          <div className="rounded-lg border bg-muted/15 p-4 text-sm">
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
          <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            Wala pang na-upload na firearms summary. Pumili ng firearms.xlsx file sa ibaba.
          </p>
        )}

        <div className="space-y-3 rounded-lg border border-dashed p-4">
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
