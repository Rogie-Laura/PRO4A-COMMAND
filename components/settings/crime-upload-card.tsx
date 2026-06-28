"use client"

import { useRef, useState, useTransition } from "react"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import { uploadCrimeRecordsAction } from "@/app/(dashboard)/settings/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CrimeUploadBatchInfo } from "@/lib/crime-records"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"

type CrimeUploadCardProps = {
  latestBatch: CrimeUploadBatchInfo | null
}

type UploadSummary = {
  insertedCount: number
  skippedRows: number
  totalVolume: number
  year: number | null
}

export function CrimeUploadCard({ latestBatch }: CrimeUploadCardProps) {
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
        const result = await uploadCrimeRecordsAction(formData)
        setBatch(result.batch)
        setSummary({
          insertedCount: result.insertedCount,
          skippedRows: result.skippedRows,
          totalVolume: result.analytics.totalVolume,
          year: result.analytics.year,
        })
        setSuccess(
          `Na-upload ang ${result.insertedCount.toLocaleString()} crime records sa Supabase.`,
        )
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error ? uploadError.message : "Hindi ma-upload ang crime stats.",
        )
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-5 text-primary" />
          Upload Crime Stats
        </CardTitle>
        <CardDescription>
          Super Admin lang. PNP-CIRAS Excel export — kukunin lang ang ppo, stn, barangay, YEAR,
          typeofPlace, dateReported, dateCommitted, timeCommitted, crime, at category. Maaaring tumagal ng
          ilang minuto ang malaking file (~21k rows).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch ? (
          <div className="rounded-lg border bg-muted/15 p-4 text-sm">
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
          <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            Wala pang na-upload na crime stats. Mag-upload ng PNP-CIRAS Excel export.
          </p>
        )}

        <div className="space-y-3 rounded-lg border border-dashed p-4">
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
                ? ` · ${summary.skippedRows.toLocaleString()} skipped (blank ppo o crime)`
                : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                Total volume: {summary.totalVolume.toLocaleString()}
              </Badge>
              {summary.year ? <Badge variant="secondary">Year: {summary.year}</Badge> : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
