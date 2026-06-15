import { Monitor } from "lucide-react"

import { DataSyncBanner } from "@/components/dashboard/data-sync-banner"
import { IctOfficeCards } from "@/components/dashboard/ict-office-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getIctEquipmentAnalytics } from "@/lib/ict-equipment-analytics"
import type { IctServiceableBreakdown } from "@/lib/ict-equipment-types"

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

function ServiceableIctEquipmentSection({
  label,
  breakdown,
  detail,
}: {
  label: string
  breakdown: IctServiceableBreakdown
  detail: string
}) {
  return (
    <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Monitor className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardDescription className="font-medium text-primary/80">{label}</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {breakdown.total.toLocaleString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <BreakdownStat label="2025 & Below" value={breakdown.year2025Below} />
          <BreakdownStat label="As of January 2026" value={breakdown.asOfJanuary2026} />
        </div>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

export function IctEquipmentLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}

export async function IctEquipmentContent() {
  const data = await getIctEquipmentAnalytics()

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl"
      >
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      <DataSyncBanner lastUpdated={data.lastUpdated} sourceLabel={data.dataSource} />

      {!data.dataReady && (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang ICT equipment data mula sa RECAP tab pa. Siguraduhing naka-public ang
            Google Sheet at may Serviceable block (row 19) na may office breakdown.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <ServiceableIctEquipmentSection
          label={data.serviceable.label}
          breakdown={data.serviceable.breakdown}
          detail={data.serviceable.detail}
        />

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardDescription className="font-medium">By Office</CardDescription>
            <CardTitle className="text-base">Serviceable breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <IctOfficeCards offices={data.serviceable.offices} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
