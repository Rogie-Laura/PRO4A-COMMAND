"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  collectStatusBreakdown,
  getDrugClearingRegionalTotal,
  getStatusFilterTitle,
} from "@/lib/drug-clearing-analytics"
import type {
  DrugClearingAnalytics,
  DrugClearingBarangayStatus,
  DrugClearingMunicipality,
  DrugClearingProvince,
  DrugClearingStatusFilter,
} from "@/lib/drug-clearing-types"
import { cn } from "@/lib/utils"
import {
  ridTableWrapperClass,
} from "@/components/dashboard/rid-table-styles"

type DrugClearingPanelProps = {
  analytics: DrugClearingAnalytics
}

type StatusFilterScope = {
  province?: string
  municipality?: string
}

type ActiveStatusFilter = {
  status: DrugClearingStatusFilter
  scope: StatusFilterScope
}

const STATUS_LABELS: Record<DrugClearingBarangayStatus, string> = {
  cleared: "Drug Cleared",
  affected: "Drug Affected",
  unaffected: "Unaffected",
  drug_free: "Drug Free",
  unknown: "Unspecified",
}

const STATUS_BADGE_CLASS: Record<DrugClearingBarangayStatus, string> = {
  cleared: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  affected: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  unaffected: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  drug_free: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  unknown: "border-muted-foreground/20 bg-muted/40 text-muted-foreground",
}

const FIGURE_CELL_CLASS: Record<DrugClearingStatusFilter, string> = {
  cleared: "text-violet-700 dark:text-violet-300",
  affected: "text-amber-700 dark:text-amber-300",
  unaffected: "text-foreground",
  drug_free: "text-emerald-700 dark:text-emerald-300",
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

const PROVINCE_STICKY_CLASS =
  "min-w-0 w-[4.25rem] max-w-[4.75rem] text-violet-700 dark:text-violet-300"

const PPO_STICKY_CLASS = "min-w-0 w-[4.25rem] max-w-[4.75rem]"

const STICKY_PPO_HEADER_CLASS = cn(
  "sticky left-0 z-30 min-w-0 w-[4.25rem] max-w-[4.75rem] border-r border-border bg-muted px-1.5 py-1.5 text-left text-[10px] font-medium leading-tight shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] sm:w-[4.75rem] sm:max-w-[5rem] sm:px-2 sm:text-xs",
)

const STICKY_PPO_CELL_CLASS = cn(
  "sticky left-0 z-20 min-w-0 w-[4.25rem] max-w-[4.75rem] border-r border-border bg-background px-1.5 py-1.5 text-[10px] font-medium leading-tight shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] sm:w-[4.75rem] sm:max-w-[5rem] sm:px-2 sm:text-xs",
)

const STICKY_PPO_TOTAL_CLASS = cn(
  "sticky left-0 z-20 min-w-0 w-[4.25rem] max-w-[4.75rem] border-r border-border bg-muted px-1.5 py-1.5 text-[10px] font-semibold leading-tight shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] sm:w-[4.75rem] sm:max-w-[5rem] sm:px-2 sm:text-xs",
)

const TABLE_DATA_HEADER_CLASS =
  "bg-muted/30 px-1.5 py-1.5 text-right text-[10px] font-medium whitespace-nowrap sm:px-2 sm:py-2 sm:text-xs"

const TABLE_DATA_CELL_CLASS =
  "bg-background px-1.5 py-1.5 text-right text-[10px] tabular-nums sm:px-2 sm:py-2 sm:text-xs"

const TABLE_DATA_TOTAL_CLASS =
  "bg-muted/20 px-1.5 py-1.5 text-right text-[10px] tabular-nums sm:px-2 sm:py-2 sm:text-xs"

function DrillDownContextBar({
  province,
  municipality,
  onBack,
  backLabel,
}: {
  province: string
  municipality: string | null
  onBack: () => void
  backLabel: string
}) {
  return (
    <div className="sticky top-14 z-20 -mx-1 space-y-2 border-b border-violet-500/15 bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:top-0">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
          <ArrowLeft className="size-4" />
          {backLabel}
        </Button>
      </div>
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          PPO
        </p>
        <p className="text-base font-semibold text-violet-700 dark:text-violet-300">{province}</p>
        {municipality ? (
          <>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Bayan
            </p>
            <p className="text-sm font-medium text-foreground">{municipality}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}

function ClickableFigure({
  value,
  status,
  onSelect,
  className,
}: {
  value: number
  status: DrugClearingStatusFilter
  onSelect: (status: DrugClearingStatusFilter) => void
  className?: string
}) {
  const clickable = value > 0

  if (!clickable) {
    return <span className={cn("tabular-nums", className)}>{formatCount(value)}</span>
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onSelect(status)
      }}
      className={cn(
        "tabular-nums underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        FIGURE_CELL_CLASS[status],
        className,
      )}
      title={`Tingnan ang ${STATUS_LABELS[status]} barangays`}
    >
      {formatCount(value)}
    </button>
  )
}

function KpiChip({
  label,
  value,
  status,
  onStatusSelect,
}: {
  label: string
  value: number
  status?: DrugClearingStatusFilter
  onStatusSelect?: (status: DrugClearingStatusFilter) => void
}) {
  const clickable = Boolean(status && onStatusSelect && value > 0)

  return (
    <div
      className={cn(
        "rounded-lg border border-violet-500/20 bg-background/70 px-4 py-3",
        clickable && "cursor-pointer transition-colors hover:border-violet-500/35 hover:bg-violet-500/5",
      )}
      onClick={clickable ? () => onStatusSelect?.(status!) : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onStatusSelect?.(status!)
              }
            }
          : undefined
      }
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          status ? FIGURE_CELL_CLASS[status] : "text-violet-700 dark:text-violet-300",
        )}
      >
        {formatCount(value)}
      </p>
      {clickable ? (
        <p className="mt-1 text-[11px] text-muted-foreground">Tap para sa PPO · Bayan · Brgy</p>
      ) : null}
    </div>
  )
}

function StatusBreakdownTable({
  title,
  status,
  rows,
  onBack,
}: {
  title: string
  status: DrugClearingStatusFilter
  rows: { ppo: string; municipality: string; barangay: string }[]
  onBack: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="sticky top-14 z-20 -mx-1 space-y-2 border-b border-violet-500/15 bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:top-0">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE_CLASS[status]}>
            {STATUS_LABELS[status]}
          </Badge>
          <p className="text-sm font-medium">{title}</p>
          <Badge variant="secondary" className="tabular-nums">
            {formatCount(rows.length)} barangays
          </Badge>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Walang barangay records para sa status na ito.</p>
      ) : (
        <div className="space-y-2">
          <div className={cn(ridTableWrapperClass, "max-h-[min(70vh,36rem)]")}>
            <table className="w-full min-w-[22rem] text-xs sm:min-w-[28rem]">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className={cn(STICKY_PPO_HEADER_CLASS, PPO_STICKY_CLASS)}>PPO</th>
                  <th className={cn(TABLE_DATA_HEADER_CLASS, "text-left")}>Bayan</th>
                  <th className={cn(TABLE_DATA_HEADER_CLASS, "text-left")}>Barangay</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.ppo}-${row.municipality}-${row.barangay}`} className="border-b last:border-0">
                    <td className={cn(STICKY_PPO_CELL_CLASS, PPO_STICKY_CLASS)}>{row.ppo}</td>
                    <td className={cn(TABLE_DATA_CELL_CLASS, "text-left")}>{row.municipality}</td>
                    <td className={cn(TABLE_DATA_CELL_CLASS, "text-left")}>{row.barangay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-muted-foreground md:hidden">
            Swipe left para makita ang Bayan at Barangay · naka-sticky ang PPO
          </p>
        </div>
      )}
    </div>
  )
}

function BarangayDetails({
  municipality,
  onStatusSelect,
}: {
  municipality: DrugClearingMunicipality
  onStatusSelect: (status: DrugClearingStatusFilter) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiChip label="Total Barangays" value={municipality.totalBarangays} />
        <KpiChip
          label="Cleared"
          value={municipality.cleared}
          status="cleared"
          onStatusSelect={() => onStatusSelect("cleared")}
        />
        <KpiChip
          label="Affected"
          value={municipality.affected}
          status="affected"
          onStatusSelect={() => onStatusSelect("affected")}
        />
        <KpiChip
          label="Unaffected"
          value={municipality.unaffected}
          status="unaffected"
          onStatusSelect={() => onStatusSelect("unaffected")}
        />
        <KpiChip
          label="Drug Free"
          value={municipality.drugFree}
          status="drug_free"
          onStatusSelect={() => onStatusSelect("drug_free")}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {municipality.barangays.map((barangay) => (
          <div
            key={`${municipality.name}-${barangay.name}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5 text-sm"
          >
            <span className="min-w-0 leading-snug">{barangay.name}</span>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-[11px]", STATUS_BADGE_CLASS[barangay.status])}
            >
              {STATUS_LABELS[barangay.status]}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function MunicipalityList({
  province,
  onSelect,
}: {
  province: DrugClearingProvince
  onSelect: (municipalityName: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatCount(province.municipalities.length)} municipalities · piliin ang bayan para sa
        barangay details
      </p>
      <div className="divide-y rounded-lg border bg-background/70">
        {province.municipalities.map((municipality) => (
          <button
            key={`${province.name}-${municipality.name}`}
            type="button"
            onClick={() => onSelect(municipality.name)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0">
              <p className="font-medium leading-snug">{municipality.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCount(municipality.totalBarangays)} barangays ·{" "}
                {formatCount(municipality.cleared)} cleared ·{" "}
                {formatCount(municipality.affected)} affected ·{" "}
                {formatCount(municipality.drugFree)} drug free
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function DrugClearingPanel({ analytics }: DrugClearingPanelProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ActiveStatusFilter | null>(null)

  const regionalTotal = useMemo(() => getDrugClearingRegionalTotal(analytics.recap), [analytics.recap])
  const provinceRows = useMemo(
    () => analytics.recap.filter((row) => !row.isTotal),
    [analytics.recap],
  )

  const activeProvince = useMemo(
    () => analytics.provinces.find((province) => province.name === selectedProvince) ?? null,
    [analytics.provinces, selectedProvince],
  )

  const activeMunicipality = useMemo(() => {
    if (!activeProvince || !selectedMunicipality) return null
    return (
      activeProvince.municipalities.find(
        (municipality) => municipality.name === selectedMunicipality,
      ) ?? null
    )
  }, [activeProvince, selectedMunicipality])

  const statusBreakdownRows = useMemo(() => {
    if (!statusFilter) return []
    return collectStatusBreakdown(
      analytics.provinces,
      statusFilter.status,
      statusFilter.scope,
    )
  }, [analytics.provinces, statusFilter])

  const statusFilterTitle = useMemo(() => {
    if (!statusFilter) return ""
    return getStatusFilterTitle(statusFilter.status, statusFilter.scope)
  }, [statusFilter])

  function openStatusFilter(status: DrugClearingStatusFilter, scope: StatusFilterScope = {}) {
    setStatusFilter({ status, scope })
  }

  function handleProvinceSelect(provinceName: string) {
    setSelectedProvince(provinceName)
    setSelectedMunicipality(null)
    setStatusFilter(null)
  }

  function handleMunicipalitySelect(municipalityName: string) {
    setSelectedMunicipality(municipalityName)
    setStatusFilter(null)
  }

  function handleBackToRecap() {
    setSelectedProvince(null)
    setSelectedMunicipality(null)
    setStatusFilter(null)
  }

  function handleBackToProvince() {
    setSelectedMunicipality(null)
    setStatusFilter(null)
  }

  function handleStatusSelectAtRecap(status: DrugClearingStatusFilter, province?: string) {
    openStatusFilter(status, province ? { province } : {})
  }

  function handleStatusSelectInDrillDown(status: DrugClearingStatusFilter) {
    if (!selectedProvince) return

    openStatusFilter(status, {
      province: selectedProvince,
      municipality: selectedMunicipality ?? undefined,
    })
  }

  if (!analytics.dataReady) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Drug Clearing / Drug Cleared Barangays</CardTitle>
          <CardDescription>
            Walang drug clearing data pa. Mag-upload ng drug_clearing.xlsx sa RCADD Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-violet-600 dark:text-violet-400" />
          Drug Clearing / Drug Cleared Barangays
        </CardTitle>
        <CardDescription>
          I-click ang province, bayan, o ang Cleared / Affected / Unaffected / Drug Free figures para
          sa PPO · Bayan · Barangay breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {statusFilter ? (
          <StatusBreakdownTable
            title={statusFilterTitle}
            status={statusFilter.status}
            rows={statusBreakdownRows}
            onBack={() => setStatusFilter(null)}
          />
        ) : null}

        {!statusFilter && !selectedProvince ? (
          <>
            {regionalTotal ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <KpiChip label="Cities / Municipalities" value={regionalTotal.citiesMunicipalities} />
                <KpiChip label="Total Barangays" value={regionalTotal.totalBarangays} />
                <KpiChip
                  label="Cleared Barangays (ROCBDC)"
                  value={regionalTotal.clearedBarangays}
                  status="cleared"
                  onStatusSelect={(status) => handleStatusSelectAtRecap(status)}
                />
                <KpiChip
                  label="Remaining Affected"
                  value={regionalTotal.remainingAffected}
                  status="affected"
                  onStatusSelect={(status) => handleStatusSelectAtRecap(status)}
                />
                <KpiChip
                  label="Unaffected Barangays"
                  value={regionalTotal.unaffected}
                  status="unaffected"
                  onStatusSelect={(status) => handleStatusSelectAtRecap(status)}
                />
                <KpiChip
                  label="Drug Free Barangays"
                  value={regionalTotal.drugFree}
                  status="drug_free"
                  onStatusSelect={(status) => handleStatusSelectAtRecap(status)}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className={ridTableWrapperClass}>
                <table className="w-full min-w-[34rem] text-xs sm:min-w-[40rem]">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className={cn(STICKY_PPO_HEADER_CLASS, PROVINCE_STICKY_CLASS)}>PPO</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>
                        <span className="sm:hidden">Mun.</span>
                        <span className="hidden sm:inline">Cities/Mun.</span>
                      </th>
                      <th className={TABLE_DATA_HEADER_CLASS}>
                        <span className="sm:hidden">Brgy</span>
                        <span className="hidden sm:inline">Total Brgy</span>
                      </th>
                      <th className={TABLE_DATA_HEADER_CLASS}>Cleared</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>Affected</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>
                        <span className="sm:hidden">Unaff.</span>
                        <span className="hidden sm:inline">Unaffected</span>
                      </th>
                      <th className={TABLE_DATA_HEADER_CLASS}>
                        <span className="sm:hidden">D.Free</span>
                        <span className="hidden sm:inline">Drug Free</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {provinceRows.map((row) => (
                      <tr
                        key={row.province}
                        className="group border-b transition-colors last:border-0 hover:bg-violet-500/5"
                      >
                        <td
                          className={cn(
                            STICKY_PPO_CELL_CLASS,
                            PROVINCE_STICKY_CLASS,
                            "cursor-pointer group-hover:bg-violet-500/5",
                          )}
                          onClick={() => handleProvinceSelect(row.province)}
                        >
                          <span className="inline-flex items-center gap-0.5 font-medium leading-tight">
                            {row.province}
                            <ChevronRight className="size-3 shrink-0 opacity-60" />
                          </span>
                        </td>
                        <td className={cn(TABLE_DATA_CELL_CLASS, "group-hover:bg-violet-500/5")}>
                          {formatCount(row.citiesMunicipalities)}
                        </td>
                        <td className={cn(TABLE_DATA_CELL_CLASS, "group-hover:bg-violet-500/5")}>
                          {formatCount(row.totalBarangays)}
                        </td>
                        <td className={cn(TABLE_DATA_CELL_CLASS, "group-hover:bg-violet-500/5")}>
                          <ClickableFigure
                            value={row.clearedBarangays}
                            status="cleared"
                            onSelect={(status) => handleStatusSelectAtRecap(status, row.province)}
                          />
                        </td>
                        <td className={cn(TABLE_DATA_CELL_CLASS, "group-hover:bg-violet-500/5")}>
                          <ClickableFigure
                            value={row.remainingAffected}
                            status="affected"
                            onSelect={(status) => handleStatusSelectAtRecap(status, row.province)}
                          />
                        </td>
                        <td className={cn(TABLE_DATA_CELL_CLASS, "group-hover:bg-violet-500/5")}>
                          <ClickableFigure
                            value={row.unaffected}
                            status="unaffected"
                            onSelect={(status) => handleStatusSelectAtRecap(status, row.province)}
                          />
                        </td>
                        <td className={cn(TABLE_DATA_CELL_CLASS, "group-hover:bg-violet-500/5")}>
                          <ClickableFigure
                            value={row.drugFree}
                            status="drug_free"
                            onSelect={(status) => handleStatusSelectAtRecap(status, row.province)}
                          />
                        </td>
                      </tr>
                    ))}
                    {regionalTotal ? (
                      <tr className="bg-muted/20 font-semibold">
                        <td className={cn(STICKY_PPO_TOTAL_CLASS, PROVINCE_STICKY_CLASS)}>TOTAL</td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          {formatCount(regionalTotal.citiesMunicipalities)}
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          {formatCount(regionalTotal.totalBarangays)}
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          <ClickableFigure
                            value={regionalTotal.clearedBarangays}
                            status="cleared"
                            onSelect={(status) => handleStatusSelectAtRecap(status)}
                          />
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          <ClickableFigure
                            value={regionalTotal.remainingAffected}
                            status="affected"
                            onSelect={(status) => handleStatusSelectAtRecap(status)}
                          />
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          <ClickableFigure
                            value={regionalTotal.unaffected}
                            status="unaffected"
                            onSelect={(status) => handleStatusSelectAtRecap(status)}
                          />
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          <ClickableFigure
                            value={regionalTotal.drugFree}
                            status="drug_free"
                            onSelect={(status) => handleStatusSelectAtRecap(status)}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-xs text-muted-foreground md:hidden">
                Swipe left para makita ang ibang columns · naka-sticky ang PPO
              </p>
            </div>
          </>
        ) : null}

        {!statusFilter && selectedProvince && activeProvince ? (
          <div className="space-y-4">
            <DrillDownContextBar
              province={selectedProvince}
              municipality={selectedMunicipality}
              onBack={selectedMunicipality ? handleBackToProvince : handleBackToRecap}
              backLabel={selectedMunicipality ? `Back to ${selectedProvince}` : "Back to recap"}
            />

            {activeMunicipality ? (
              <BarangayDetails
                municipality={activeMunicipality}
                onStatusSelect={handleStatusSelectInDrillDown}
              />
            ) : (
              <MunicipalityList province={activeProvince} onSelect={handleMunicipalitySelect} />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
