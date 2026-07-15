"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ChevronRight, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ridTableWrapperClass } from "@/components/dashboard/rid-table-styles"
import {
  collectMobilizationBreakdown,
  getCommunityMobilizationRegionalTotal,
  getMobilizationFilterTitle,
} from "@/lib/community-mobilization-analytics"
import type {
  CommunityMobilizationAnalytics,
  CommunityMobilizationBarangayStatus,
  CommunityMobilizationMunicipality,
  CommunityMobilizationProvince,
} from "@/lib/community-mobilization-types"
import { cn } from "@/lib/utils"

type CommunityMobilizationPanelProps = {
  analytics: CommunityMobilizationAnalytics
}

type StatusFilterScope = {
  province?: string
  municipality?: string
}

type ActiveStatusFilter = {
  status: CommunityMobilizationBarangayStatus
  scope: StatusFilterScope
}

const STATUS_LABELS: Record<CommunityMobilizationBarangayStatus, string> = {
  mobilized: "Mobilized",
  not_yet_mobilized: "Not yet mobilized",
}

const STATUS_BADGE_CLASS: Record<CommunityMobilizationBarangayStatus, string> = {
  mobilized: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  not_yet_mobilized: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
}

const FIGURE_CELL_CLASS: Record<CommunityMobilizationBarangayStatus, string> = {
  mobilized: "text-emerald-700 dark:text-emerald-300",
  not_yet_mobilized: "text-amber-700 dark:text-amber-300",
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

function formatPct(value: number | null) {
  return value == null ? "—" : `${value.toLocaleString("en-PH", { maximumFractionDigits: 1 })}%`
}

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
    <div className="sticky top-0 z-20 -mx-1 space-y-2 border-b border-sky-500/15 bg-background px-1 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
          <ArrowLeft className="size-4" />
          {backLabel}
        </Button>
      </div>
      <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">PPO</p>
        <p className="text-base font-semibold text-sky-700 dark:text-sky-300">{province}</p>
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
  status: CommunityMobilizationBarangayStatus
  onSelect: (status: CommunityMobilizationBarangayStatus) => void
  className?: string
}) {
  if (value <= 0) {
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
      title={`View ${STATUS_LABELS[status]} barangays`}
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
  hint,
}: {
  label: string
  value: number
  status?: CommunityMobilizationBarangayStatus
  onStatusSelect?: (status: CommunityMobilizationBarangayStatus) => void
  hint?: string
}) {
  const clickable = Boolean(status && onStatusSelect && value > 0)

  return (
    <div
      className={cn(
        "rounded-lg border border-sky-500/20 bg-background/70 px-4 py-3",
        clickable &&
          "cursor-pointer transition-colors hover:border-sky-500/35 hover:bg-sky-500/5",
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
          status ? FIGURE_CELL_CLASS[status] : "text-sky-700 dark:text-sky-300",
        )}
      >
        {formatCount(value)}
      </p>
      {clickable ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {hint ?? "Tap to view barangay names"}
        </p>
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
  status: CommunityMobilizationBarangayStatus
  rows: { ppo: string; municipality: string; barangay: string }[]
  onBack: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-20 -mx-1 space-y-2 border-b border-sky-500/15 bg-background px-1 py-2">
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
        <p className="text-sm text-muted-foreground">No barangay names for this filter.</p>
      ) : (
        <div className="space-y-2">
          <div className={cn(ridTableWrapperClass, "max-h-[min(70vh,36rem)]")}>
            <table className="w-full min-w-[22rem] text-xs sm:min-w-[28rem]">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className={STICKY_PPO_HEADER_CLASS}>PPO</th>
                  <th className={cn(TABLE_DATA_HEADER_CLASS, "text-left")}>Bayan</th>
                  <th className={cn(TABLE_DATA_HEADER_CLASS, "text-left")}>Barangay</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.ppo}-${row.municipality}-${row.barangay}`}
                    className="border-b last:border-0"
                  >
                    <td className={STICKY_PPO_CELL_CLASS}>{row.ppo}</td>
                    <td className={cn(TABLE_DATA_CELL_CLASS, "text-left")}>{row.municipality}</td>
                    <td className={cn(TABLE_DATA_CELL_CLASS, "text-left")}>{row.barangay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function BarangayDetails({
  municipality,
  onStatusSelect,
}: {
  municipality: CommunityMobilizationMunicipality
  onStatusSelect: (status: CommunityMobilizationBarangayStatus) => void
}) {
  const mobilized = municipality.barangays.filter((b) => b.status === "mobilized")
  const notYet = municipality.barangays.filter((b) => b.status === "not_yet_mobilized")

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiChip label="Total Barangays" value={municipality.totalBarangays} />
        <KpiChip
          label="Mobilized"
          value={municipality.mobilized}
          status="mobilized"
          onStatusSelect={() => onStatusSelect("mobilized")}
        />
        <KpiChip
          label="Not yet mobilized"
          value={municipality.remaining}
          status="not_yet_mobilized"
          onStatusSelect={() => onStatusSelect("not_yet_mobilized")}
        />
        <div className="rounded-lg border border-sky-500/20 bg-background/70 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Compliance</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-sky-700 dark:text-sky-300">
            {formatPct(municipality.compliancePct)}
          </p>
        </div>
      </div>

      {notYet.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Not yet mobilized barangays</p>
            <Badge variant="outline" className={STATUS_BADGE_CLASS.not_yet_mobilized}>
              {formatCount(notYet.length)}
            </Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {notYet.map((barangay) => (
              <div
                key={`ny-${municipality.name}-${barangay.name}`}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm"
              >
                {barangay.name}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {mobilized.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Mobilized barangays</p>
            <Badge variant="outline" className={STATUS_BADGE_CLASS.mobilized}>
              {formatCount(mobilized.length)}
            </Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {mobilized.map((barangay) => (
              <div
                key={`m-${municipality.name}-${barangay.name}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5 text-sm"
              >
                <span className="min-w-0 leading-snug">{barangay.name}</span>
                <Badge variant="outline" className={cn("shrink-0 text-[11px]", STATUS_BADGE_CLASS.mobilized)}>
                  Mobilized
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {municipality.barangays.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No barangay name list for this municipality in the CMP workbook.
        </p>
      ) : null}
    </div>
  )
}

function MunicipalityList({
  province,
  onSelect,
  onStatusSelect,
}: {
  province: CommunityMobilizationProvince
  onSelect: (municipalityName: string) => void
  onStatusSelect: (
    municipalityName: string,
    status: CommunityMobilizationBarangayStatus,
  ) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatCount(province.municipalities.length)} municipalities · tap a bayan for barangay
        details, or tap Remaining for not-yet-mobilized names
      </p>
      <div className="divide-y rounded-lg border bg-background/70">
        {province.municipalities.map((municipality) => (
          <div
            key={`${province.name}-${municipality.name}`}
            className="flex w-full items-center justify-between gap-3 px-4 py-3"
          >
            <button
              type="button"
              onClick={() => onSelect(municipality.name)}
              className="min-w-0 flex-1 text-left transition-colors hover:text-sky-700 dark:hover:text-sky-300"
            >
              <p className="font-medium leading-snug">{municipality.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCount(municipality.totalBarangays)} barangays ·{" "}
                {formatCount(municipality.mobilized)} mobilized · compliance{" "}
                {formatPct(municipality.compliancePct)}
              </p>
            </button>
            <div className="flex shrink-0 items-center gap-3">
              <ClickableFigure
                value={municipality.remaining}
                status="not_yet_mobilized"
                onSelect={(status) => onStatusSelect(municipality.name, status)}
                className="text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => onSelect(municipality.name)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label={`Open ${municipality.name}`}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CommunityMobilizationPanel({ analytics }: CommunityMobilizationPanelProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ActiveStatusFilter | null>(null)

  const regionalTotal = useMemo(
    () => getCommunityMobilizationRegionalTotal(analytics.recap),
    [analytics.recap],
  )
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
    return collectMobilizationBreakdown(
      analytics.provinces,
      statusFilter.status,
      statusFilter.scope,
    )
  }, [analytics.provinces, statusFilter])

  const statusFilterTitle = useMemo(() => {
    if (!statusFilter) return ""
    return getMobilizationFilterTitle(statusFilter.status, statusFilter.scope)
  }, [statusFilter])

  function openStatusFilter(
    status: CommunityMobilizationBarangayStatus,
    scope: StatusFilterScope = {},
  ) {
    setStatusFilter({ status, scope })
  }

  function handleProvinceSelect(provinceName: string) {
    setSelectedProvince(provinceName)
    setSelectedMunicipality(null)
    setStatusFilter(null)
  }

  if (!analytics.dataReady) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersRound className="size-5 text-muted-foreground" />
            Community Mobilization
          </CardTitle>
          <CardDescription>
            Upload CMP.xlsx sa RCADD upload page para lumabas ang PPO · Bayan · Barangay recap.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-sky-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UsersRound className="size-5 text-sky-600 dark:text-sky-400" />
          Community Mobilization
        </CardTitle>
        <CardDescription>
          Certified mobilized barangays
          {analytics.asOfLabel ? ` · as of ${analytics.asOfLabel}` : ""}
          {analytics.fileName ? ` · ${analytics.fileName}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusFilter ? (
          <StatusBreakdownTable
            title={statusFilterTitle}
            status={statusFilter.status}
            rows={statusBreakdownRows}
            onBack={() => setStatusFilter(null)}
          />
        ) : activeMunicipality && activeProvince ? (
          <>
            <DrillDownContextBar
              province={activeProvince.name}
              municipality={activeMunicipality.name}
              backLabel="Back to municipalities"
              onBack={() => {
                setSelectedMunicipality(null)
                setStatusFilter(null)
              }}
            />
            <BarangayDetails
              municipality={activeMunicipality}
              onStatusSelect={(status) =>
                openStatusFilter(status, {
                  province: activeProvince.name,
                  municipality: activeMunicipality.name,
                })
              }
            />
          </>
        ) : activeProvince ? (
          <>
            <DrillDownContextBar
              province={activeProvince.name}
              municipality={null}
              backLabel="Back to regional recap"
              onBack={() => {
                setSelectedProvince(null)
                setSelectedMunicipality(null)
                setStatusFilter(null)
              }}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <KpiChip
                label="Mobilized"
                value={activeProvince.municipalities.reduce((sum, m) => sum + m.mobilized, 0)}
                status="mobilized"
                onStatusSelect={(status) =>
                  openStatusFilter(status, { province: activeProvince.name })
                }
              />
              <KpiChip
                label="Not yet mobilized"
                value={activeProvince.municipalities.reduce((sum, m) => sum + m.remaining, 0)}
                status="not_yet_mobilized"
                onStatusSelect={(status) =>
                  openStatusFilter(status, { province: activeProvince.name })
                }
              />
              <KpiChip
                label="Municipalities"
                value={activeProvince.municipalities.length}
              />
            </div>
            <MunicipalityList
              province={activeProvince}
              onSelect={(name) => {
                setSelectedMunicipality(name)
                setStatusFilter(null)
              }}
              onStatusSelect={(municipalityName, status) =>
                openStatusFilter(status, {
                  province: activeProvince.name,
                  municipality: municipalityName,
                })
              }
            />
          </>
        ) : (
          <>
            {regionalTotal ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiChip label="Total Barangays" value={regionalTotal.totalBarangays} />
                <KpiChip
                  label="Mobilized"
                  value={regionalTotal.mobilized}
                  status="mobilized"
                  onStatusSelect={(status) => openStatusFilter(status)}
                />
                <KpiChip
                  label="Not yet mobilized"
                  value={regionalTotal.remaining}
                  status="not_yet_mobilized"
                  onStatusSelect={(status) => openStatusFilter(status)}
                  hint="Tap to list all not-yet-mobilized barangays"
                />
                <div className="rounded-lg border border-sky-500/20 bg-background/70 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">Compliance</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-sky-700 dark:text-sky-300">
                    {formatPct(regionalTotal.compliancePct)}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tap a PPO row for municipality recap · tap Remaining / Mobilized counts for
                barangay names
              </p>
              <div className={cn(ridTableWrapperClass)}>
                <table className="w-full min-w-[32rem] text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className={STICKY_PPO_HEADER_CLASS}>PPO</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>Brgys</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>Mobilized</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>Remaining</th>
                      <th className={TABLE_DATA_HEADER_CLASS}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provinceRows.map((row) => (
                      <tr
                        key={row.province}
                        className="cursor-pointer border-b transition-colors last:border-0 hover:bg-sky-500/5"
                        onClick={() => handleProvinceSelect(row.province)}
                      >
                        <td className={cn(STICKY_PPO_CELL_CLASS, "text-sky-700 dark:text-sky-300")}>
                          <span className="inline-flex items-center gap-1">
                            {row.province}
                            <ChevronRight className="size-3.5 opacity-60" />
                          </span>
                        </td>
                        <td className={TABLE_DATA_CELL_CLASS}>{formatCount(row.totalBarangays)}</td>
                        <td className={TABLE_DATA_CELL_CLASS}>
                          <ClickableFigure
                            value={row.mobilized}
                            status="mobilized"
                            onSelect={(status) =>
                              openStatusFilter(status, { province: row.province })
                            }
                          />
                        </td>
                        <td className={TABLE_DATA_CELL_CLASS}>
                          <ClickableFigure
                            value={row.remaining}
                            status="not_yet_mobilized"
                            onSelect={(status) =>
                              openStatusFilter(status, { province: row.province })
                            }
                          />
                        </td>
                        <td className={TABLE_DATA_CELL_CLASS}>{formatPct(row.compliancePct)}</td>
                      </tr>
                    ))}
                    {regionalTotal ? (
                      <tr className="border-t">
                        <td className={STICKY_PPO_TOTAL_CLASS}>{regionalTotal.province}</td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          {formatCount(regionalTotal.totalBarangays)}
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          <ClickableFigure
                            value={regionalTotal.mobilized}
                            status="mobilized"
                            onSelect={(status) => openStatusFilter(status)}
                          />
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          <ClickableFigure
                            value={regionalTotal.remaining}
                            status="not_yet_mobilized"
                            onSelect={(status) => openStatusFilter(status)}
                          />
                        </td>
                        <td className={TABLE_DATA_TOTAL_CLASS}>
                          {formatPct(regionalTotal.compliancePct)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
