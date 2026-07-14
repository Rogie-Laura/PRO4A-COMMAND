import { Monitor } from "lucide-react"

import { IctEquipmentRefreshButton } from "@/components/dashboard/ict-equipment-refresh-button"
import { IctEquipmentStatusSections } from "@/components/dashboard/ict-equipment-status-sections"
import { IctServiceableExtras } from "@/components/dashboard/ict-serviceable-extras"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getIctEquipmentAnalytics } from "@/lib/ict-equipment-analytics"
import type { IctStatusSection } from "@/lib/ict-equipment-types"

function BreakdownStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">{value.toLocaleString()}</p>
    </div>
  )
}

function TotalIctEquipmentCard({
  label,
  breakdown,
}: {
  label: string
  breakdown: IctStatusSection["breakdown"]
}) {
  return (
    <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card sm:max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Monitor className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardDescription className="font-medium text-primary/80">{label}</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {breakdown.total.toLocaleString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <BreakdownStat label="2025 & Below" value={breakdown.year2025Below} />
          <BreakdownStat label="As of January 2026" value={breakdown.asOfJanuary2026} />
        </div>
      </CardContent>
    </Card>
  )
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function IctEquipmentLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-40 max-w-xl rounded-xl" />
      <Skeleton className="h-[28rem] rounded-xl lg:hidden" />
      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        <Skeleton className="h-[28rem] rounded-xl" />
        <Skeleton className="h-[28rem] rounded-xl" />
        <Skeleton className="h-[28rem] rounded-xl" />
      </div>
      <Skeleton className="h-6 w-48 rounded" />
      <Skeleton className="h-[28rem] rounded-xl lg:hidden" />
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <Skeleton className="h-[28rem] rounded-xl" />
        <Skeleton className="h-[28rem] rounded-xl" />
      </div>
      <Skeleton className="h-6 w-56 rounded" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  )
}

export async function IctEquipmentContent() {
  const data = await getIctEquipmentAnalytics()

  const statusSlides = [
    { variant: "serviceable" as const, section: data.serviceable },
    { variant: "unserviceable" as const, section: data.unserviceable },
    { variant: "ber" as const, section: data.ber },
  ]

  const acquisitionSlides = [
    { variant: "pnpNhq" as const, section: data.pnpIssuedByNhq },
    { variant: "procuredPro" as const, section: data.procuredByPro },
  ]

  return (
    <div className="relative space-y-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl"
      >
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <div className="flex justify-end">
        <IctEquipmentRefreshButton />
      </div>

      {!data.dataReady && (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang ICT equipment data pa. Mag-upload ng Inventory of Devices workbook (RECAP
            sheet) sa Upload File.
          </CardContent>
        </Card>
      )}

      <TotalIctEquipmentCard
        label={data.grandTotal.label}
        breakdown={data.grandTotal.breakdown}
      />

      <IctEquipmentStatusSections
        conditionSlides={statusSlides}
        sourceSlides={acquisitionSlides}
      />

      <div className="space-y-4">
        <SectionHeading title="Serviceable Device Breakdown" />
        <IctServiceableExtras
          cybereason={data.serviceable.cybereason}
          storage={data.serviceable.storage}
        />
      </div>
    </div>
  )
}
