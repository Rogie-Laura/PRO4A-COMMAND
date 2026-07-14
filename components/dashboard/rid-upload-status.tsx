import { CheckCircle2Icon, CircleDashedIcon } from "lucide-react"

import { formatPhilippinesDateTime } from "@/lib/format-datetime"
import { getLatestCriminalGangsUploadBatch } from "@/lib/criminal-gangs-records"
import { getLatestForeignNationalUploadBatch } from "@/lib/foreign-national-records"
import { getLatestIllegalDrugsUploadBatch } from "@/lib/illegal-drugs-records"
import { getLatestIntelEligibilityUploadBatch } from "@/lib/intel-eligibility-records"
import { getLatestSurrenderedCtgfUploadBatch } from "@/lib/surrendered-ctgf-records"
import { getLatestTerrorismThreatUploadBatch } from "@/lib/terrorism-threat-records"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type UploadStatusItem = {
  label: string
  uploadedAt: string | null
}

function UploadStatusLine({ label, uploadedAt }: UploadStatusItem) {
  const isUploaded = Boolean(uploadedAt)

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-border/50 py-2 last:border-0 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {isUploaded ? (
        <span className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-right">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2Icon className="size-3.5 shrink-0" aria-hidden />
            Uploaded
          </span>
          <span className="text-muted-foreground">{formatPhilippinesDateTime(uploadedAt!)}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <CircleDashedIcon className="size-3.5 shrink-0" aria-hidden />
          Wala pang upload
        </span>
      )}
    </div>
  )
}

export async function RidUploadStatus() {
  const [
    intelEligibilityBatch,
    illegalDrugsBatch,
    criminalGangsBatch,
    surrenderedCtgfBatch,
    foreignNationalBatch,
    terrorismThreatBatch,
  ] = await Promise.all([
    getLatestIntelEligibilityUploadBatch().catch(() => null),
    getLatestIllegalDrugsUploadBatch().catch(() => null),
    getLatestCriminalGangsUploadBatch().catch(() => null),
    getLatestSurrenderedCtgfUploadBatch().catch(() => null),
    getLatestForeignNationalUploadBatch().catch(() => null),
    getLatestTerrorismThreatUploadBatch().catch(() => null),
  ])

  const items: UploadStatusItem[] = [
    {
      label: "Intelligence Eligibility List",
      uploadedAt: intelEligibilityBatch?.createdAt ?? null,
    },
    { label: "Illegal Drugs", uploadedAt: illegalDrugsBatch?.createdAt ?? null },
    { label: "Criminal Gangs", uploadedAt: criminalGangsBatch?.createdAt ?? null },
    {
      label: "Surrendered CTGs & FAs",
      uploadedAt: surrenderedCtgfBatch?.createdAt ?? null,
    },
    {
      label: "Foreign National Incidents",
      uploadedAt: foreignNationalBatch?.createdAt ?? null,
    },
    {
      label: "Terrorism Threat Level",
      uploadedAt: terrorismThreatBatch?.createdAt ?? null,
    },
  ]

  return (
    <Card className={cn("border-border/60 bg-muted/15")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Upload Status</CardTitle>
        <CardDescription>Latest upload time per RID workbook</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y-0">
          {items.map((item) => (
            <UploadStatusLine key={item.label} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
