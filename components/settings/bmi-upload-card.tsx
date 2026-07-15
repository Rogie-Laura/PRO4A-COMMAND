"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"

import {
  abortBmiUploadAction,
  appendBmiRecordsChunkAction,
  beginBmiUploadAction,
  finalizeBmiUploadAction,
} from "@/app/(dashboard)/settings/actions"
import { useUploadConfirmation } from "@/components/settings/use-upload-confirmation"
import { parseBmiXlsx, type ParsedBmiRecord } from "@/lib/bmi-xlsx-parser"
import { formatServerActionError } from "@/lib/server-action-errors"
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
import { formatMonthKeyLabel } from "@/lib/bmi-month"
import type { BmiUploadBatchInfo } from "@/lib/bmi-records"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import {
  UPLOAD_CARD_CLASS,
  UPLOAD_DROPZONE_CLASS,
  UPLOAD_EMPTY_STATE_CLASS,
  UPLOAD_STATUS_BOX_CLASS,
} from "@/components/settings/upload-card-styles"
import { validateXlsxFile } from "@/lib/upload-file-validation"

const UPLOAD_CHUNK_SIZE = 500

type BmiUploadCardProps = {
  latestBatch: BmiUploadBatchInfo | null
  storedMonths?: BmiUploadBatchInfo[]
}

type UploadSummary = {
  insertedCount: number
  skippedRows: number
  categoryPreview: Partial<Record<(typeof BMI_CATEGORIES)[number]["id"], number>>
}

function chunkRecords(records: ParsedBmiRecord[], size: number) {
  const chunks: ParsedBmiRecord[][] = []
  for (let index = 0; index < records.length; index += size) {
    chunks.push(records.slice(index, index + size))
  }
  return chunks
}

export function BmiUploadCard({ latestBatch, storedMonths = [] }: BmiUploadCardProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [summary, setSummary] = useState<UploadSummary | null>(null)
  const [batch, setBatch] = useState(latestBatch)

  const { isPending, openConfirmation, confirmDialog } = useUploadConfirmation({
    validateFile: validateXlsxFile,
    onUpload: async (file, { setProgress }) => {
      let batchId: string | null = null

      try {
        setProgress("Binabasa ang Excel file...")
        const parsed = parseBmiXlsx(await file.arrayBuffer())

        if (parsed.records.length === 0) {
          throw new Error("Walang valid BMI rows sa file.")
        }

        const started = await beginBmiUploadAction(file.name)
        batchId = started.id

        const chunks = chunkRecords(parsed.records, UPLOAD_CHUNK_SIZE)
        for (let index = 0; index < chunks.length; index += 1) {
          setProgress(`Sine-save ang records... (${index + 1}/${chunks.length})`)
          await appendBmiRecordsChunkAction(batchId, chunks[index]!)
        }

        setProgress("Tinatapos ang upload...")
        const result = await finalizeBmiUploadAction(batchId)
        batchId = null

        setBatch(result.batch)
        setSummary({
          insertedCount: result.insertedCount,
          skippedRows: parsed.skippedRows,
          categoryPreview: parsed.categoryPreview,
        })
        setSuccess(
          `Na-upload ang ${result.insertedCount.toLocaleString()} BMI records sa Supabase.`,
        )
        router.refresh()
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (uploadError) {
        if (batchId) {
          try {
            await abortBmiUploadAction(batchId)
          } catch {
            // Best-effort cleanup for partial uploads.
          }
        }

        const message = formatServerActionError(uploadError, "Hindi ma-upload ang BMI records.")
        throw new Error(
          message.includes("413") || message.toLowerCase().includes("too large")
            ? "Masyadong malaki ang request. Subukan ulit — na-chunk na ang upload sa latest version."
            : message,
        )
      }
    },
  })

  function handleUploadClick() {
    const file = fileInputRef.current?.files?.[0]
    setError(null)
    setSuccess(null)
    setSummary(null)

    if (!file) {
      setError("Pumili muna ng Excel file (.xlsx).")
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
            Upload BMI Records
          </CardTitle>
          <CardDescription>
            Super Admin lang. Gamitin ang sample Excel format (Rank Fullname, SubUnitDesc, Assignment,
            BMI Class, Age, Height, Weight, atbp.). Naka-tag ang bawat upload ayon sa buwan ng{" "}
            <span className="font-medium">Date Taken</span>, kaya iniingatan ang bawat buwan — hindi
            na binubura ang naunang buwan. Kailangan ng dalawang buwan para lumabas ang weight/BMI
            tracking. Maaaring tumagal ng 1–2 minuto ang malaking file (~14k rows).
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

          {storedMonths.length > 0 ? (
            <div className="rounded-lg border bg-muted/10 p-4 text-sm">
              <p className="font-medium">Naka-store na buwan ({storedMonths.length})</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {storedMonths.map((month) => (
                  <Badge key={month.id} variant="secondary">
                    {month.periodMonth ? formatMonthKeyLabel(month.periodMonth) : month.filename} ·{" "}
                    {month.recordCount.toLocaleString()}
                  </Badge>
                ))}
              </div>
              {storedMonths.length < 2 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Mag-upload ng isa pang buwan (hal. May 2026) para lumabas ang buwan-sa-buwan na
                  tracking sa Health &amp; BMI page.
                </p>
              ) : null}
            </div>
          ) : null}

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

            <Button onClick={handleUploadClick} disabled={isPending}>
              <UploadIcon />
              {isPending ? "Ina-upload..." : "Upload to Supabase"}
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
    </>
  )
}
