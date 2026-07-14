"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadRprmdWorkbookAction } from "@/app/(dashboard)/settings/actions"
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
import type { RprmdWorkbookUploadBatchInfo } from "@/lib/rprmd-workbook-types"
import { formatServerActionError } from "@/lib/server-action-errors"
import { cn } from "@/lib/utils"

type RprmdWorkbookUploadCardProps = {
  latestBatch: RprmdWorkbookUploadBatchInfo | null
  compact?: boolean
}

type UploadSummary = {
  personnelCount: number
  mandatoryCount: number
  specializedCount: number
  detailedNhq: number
  detailedNosus: number
  detailedRsu: number
  detailedRhqPpo: number
  alphalistSheetName: string
}

export function RprmdWorkbookUploadCard({ latestBatch, compact = false }: RprmdWorkbookUploadCardProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [summary, setSummary] = useState<UploadSummary | null>(null)
  const [batch, setBatch] = useState(latestBatch)
  const [isPending, startTransition] = useTransition()

  function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    setError(null)
    setSuccess(null)
    setSummary(null)

    if (!file) {
      setError("Pumili muna ng Excel file (.xlsx).")
      return
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Excel (.xlsx) lang ang tinatanggap.")
      return
    }

    const formData = new FormData()
    formData.set("file", file)

    startTransition(async () => {
      try {
        const result = await uploadRprmdWorkbookAction(formData)
        setBatch(result.batch)
        setSummary(result.summary)
        setSuccess("Na-upload ang RPRMD workbook. Makikita na ang data sa dashboard.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        router.refresh()
      } catch (uploadError) {
        setError(formatServerActionError(uploadError, "Hindi ma-upload ang RPRMD workbook."))
      }
    })
  }

  return (
    <Card className={cn(UPLOAD_CARD_CLASS, compact && "shadow-sm")}>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-5 text-primary" />
          Upload Alphalist Workbook
        </CardTitle>
        <CardDescription>
          Alphalist sheet (yellow tab) para sa personnel stats, Mandatory at Specialized Schooling
          (walang Authority column), at Detailed tabs (walang Authority). Hindi kasama ang RPHAS
          sheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch ? (
          <div className={UPLOAD_STATUS_BOX_CLASS}>
            <p className="font-medium">Latest upload</p>
            <p className="mt-1 text-muted-foreground">{batch.filename}</p>
            <p className="text-xs text-muted-foreground">
              {batch.uploadedByLabel ? `${batch.uploadedByLabel} · ` : ""}
              {formatPhilippinesDateTime(batch.createdAt)}
            </p>
          </div>
        ) : (
          <p className={UPLOAD_EMPTY_STATE_CLASS}>
            Wala pang na-upload na Alphalist workbook. Mag-upload ng RPRMD Excel export.
          </p>
        )}

        <div className={UPLOAD_DROPZONE_CLASS}>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Excel file (.xlsx)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={isPending}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </label>

          <Button onClick={handleUpload} disabled={isPending}>
            <UploadIcon />
            {isPending ? "Ina-upload..." : "Upload to Supabase"}
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}

        {summary ? (
          <div className="rounded-lg border bg-muted/10 p-4 text-sm">
            <p className="font-medium">Upload summary</p>
            <p className="mt-1 text-muted-foreground">Sheet: {summary.alphalistSheetName}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                Personnel: {summary.personnelCount.toLocaleString()}
              </Badge>
              <Badge variant="secondary">
                Mandatory: {summary.mandatoryCount.toLocaleString()}
              </Badge>
              <Badge variant="secondary">
                Specialized: {summary.specializedCount.toLocaleString()}
              </Badge>
              <Badge variant="outline">NHQ: {summary.detailedNhq.toLocaleString()}</Badge>
              <Badge variant="outline">NOSUs: {summary.detailedNosus.toLocaleString()}</Badge>
              <Badge variant="outline">RSU: {summary.detailedRsu.toLocaleString()}</Badge>
              <Badge variant="outline">RHQ&PPO: {summary.detailedRhqPpo.toLocaleString()}</Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
