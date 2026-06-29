"use client"

import { useRef, useState, useTransition } from "react"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadBmiRecordsAction } from "@/app/(dashboard)/settings/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BMI_CATEGORIES } from "@/lib/bmi-config"
import type { BmiUploadBatchInfo } from "@/lib/bmi-records"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import {
  UPLOAD_CARD_CLASS,
  UPLOAD_DROPZONE_CLASS,
  UPLOAD_EMPTY_STATE_CLASS,
  UPLOAD_STATUS_BOX_CLASS,
} from "@/components/settings/upload-card-styles"

type BmiUploadCardProps = {
  latestBatch: BmiUploadBatchInfo | null
}

type UploadSummary = {
  insertedCount: number
  skippedRows: number
  categoryPreview: Partial<Record<(typeof BMI_CATEGORIES)[number]["id"], number>>
}

export function BmiUploadCard({ latestBatch }: BmiUploadCardProps) {
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
      setError("Excel (.xlsx) lang ang tinatanggap. Gamitin ang sample na With BMI List.xlsx.")
      return
    }

    const formData = new FormData()
    formData.set("file", file)

    startTransition(async () => {
      try {
        const result = await uploadBmiRecordsAction(formData)
        setBatch(result.batch)
        setSummary({
          insertedCount: result.insertedCount,
          skippedRows: result.skippedRows,
          categoryPreview: result.categoryPreview,
        })
        setSuccess(
          `Na-upload ang ${result.insertedCount.toLocaleString()} BMI records sa Supabase.`,
        )
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error ? uploadError.message : "Hindi ma-upload ang BMI records.",
        )
      }
    })
  }

  return (
    <Card className={UPLOAD_CARD_CLASS}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-5 text-primary" />
          Upload BMI Records
        </CardTitle>
        <CardDescription>
          Super Admin lang. Gamitin ang sample Excel format (Rank Fullname, SubUnitDesc, Assignment,
          BMI Class, Age, Height, Weight, atbp.). Kapag may upload, iyon ang gagamitin ng Health &
          BMI dashboard. Maaaring tumagal ng 1–2 minuto ang malaking file (~14k rows).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch ? (
          <div className={UPLOAD_STATUS_BOX_CLASS}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">Latest upload</p>
              <Badge variant="outline">{batch.recordCount.toLocaleString()} records</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{batch.filename}</p>
            <p className="text-xs text-muted-foreground">
              {batch.uploadedByLabel ? `${batch.uploadedByLabel} · ` : ""}
              {formatPhilippinesDateTime(batch.createdAt)}
            </p>
          </div>
        ) : (
          <p className={UPLOAD_EMPTY_STATE_CLASS}>
            Wala pang na-upload na BMI records. Gagamitin muna ang Google Sheet fallback sa Health
            & BMI page.
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
            {isPending ? "Ina-upload... (huwag isara ang page)" : "Upload to Supabase"}
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}

        {summary ? (
          <div className="rounded-lg border bg-muted/10 p-4 text-sm">
            <p className="font-medium">Upload summary</p>
            <p className="mt-1 text-muted-foreground">
              {summary.insertedCount.toLocaleString()} valid rows
              {summary.skippedRows > 0
                ? ` · ${summary.skippedRows.toLocaleString()} skipped (blank o invalid BMI class)`
                : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BMI_CATEGORIES.map((category) => {
                const count = summary.categoryPreview[category.id] ?? 0
                if (count === 0) return null

                return (
                  <Badge key={category.id} variant="secondary">
                    {category.label}: {count.toLocaleString()}
                  </Badge>
                )
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
