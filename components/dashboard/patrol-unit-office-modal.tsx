"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ChevronRight } from "lucide-react"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OfficeLogo } from "@/components/dashboard/office-logo"
import type { PatrolUnitTypeId } from "@/lib/patrol-intervention-config"
import { resolvePatrolOfficeDisplay, sortPatrolOfficeRows } from "@/lib/patrol-office-map"
import type { PatrolOfficeBreakdownRow, PatrolUnitBreakdownRow } from "@/lib/patrollers-counts"
import { cn } from "@/lib/utils"

type PatrolUnitOfficeModalProps = {
  patrolTypeId: PatrolUnitTypeId | null
  patrolTypeLabel: string | null
  patrolTypeImage: string | null
  officeBreakdown: PatrolOfficeBreakdownRow[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SummaryStat({
  label,
  value,
  tone = "primary",
}: {
  label: string
  value: number
  tone?: "primary" | "emerald"
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        tone === "primary"
          ? "border-primary/20 bg-primary/10"
          : "border-emerald-500/20 bg-emerald-500/10",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          tone === "primary" ? "text-primary" : "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function CountPill({
  value,
  tone = "primary",
}: {
  value: number
  tone?: "primary" | "emerald"
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-10 justify-end rounded-md px-2.5 py-1 text-sm font-bold tabular-nums",
        tone === "primary"
          ? "bg-primary/10 text-primary"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      {value.toLocaleString()}
    </span>
  )
}

function filterUnitsForType(
  units: PatrolUnitBreakdownRow[],
  patrolTypeId: PatrolUnitTypeId,
) {
  return units
    .filter((row) => row.counts[patrolTypeId] > 0 || row.duty_counts[patrolTypeId] > 0)
    .sort((a, b) => a.unit.localeCompare(b.unit))
}

export function PatrolUnitOfficeModal({
  patrolTypeId,
  patrolTypeLabel,
  patrolTypeImage,
  officeBreakdown,
  open,
  onOpenChange,
}: PatrolUnitOfficeModalProps) {
  const [selectedOfficeKey, setSelectedOfficeKey] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSelectedOfficeKey(null)
    }
  }, [open])

  const officeRows =
    patrolTypeId === null
      ? []
      : sortPatrolOfficeRows(officeBreakdown).filter(
          (row) => row.counts[patrolTypeId] > 0 || row.duty_counts[patrolTypeId] > 0,
        )

  const selectedOfficeRow = selectedOfficeKey
    ? officeRows.find((row) => row.office === selectedOfficeKey) ?? null
    : null

  const selectedOfficeDisplay = selectedOfficeRow
    ? resolvePatrolOfficeDisplay(selectedOfficeRow.office)
    : null

  const unitRows =
    patrolTypeId && selectedOfficeRow
      ? filterUnitsForType(selectedOfficeRow.units ?? [], patrolTypeId)
      : []

  const totalUnits =
    patrolTypeId === null
      ? 0
      : selectedOfficeRow
        ? selectedOfficeRow.counts[patrolTypeId] ?? 0
        : officeRows.reduce((sum, row) => sum + (row.counts[patrolTypeId] ?? 0), 0)

  const totalOnDuty =
    patrolTypeId === null
      ? 0
      : selectedOfficeRow
        ? selectedOfficeRow.duty_counts[patrolTypeId] ?? 0
        : officeRows.reduce((sum, row) => sum + (row.duty_counts[patrolTypeId] ?? 0), 0)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedOfficeKey(null)
    }
    onOpenChange(nextOpen)
  }

  function handleOfficeClick(officeKey: string, unitCount: number) {
    if (unitCount === 0) return
    setSelectedOfficeKey(officeKey)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {patrolTypeLabel && patrolTypeId ? (
          <>
            <DialogHeader className="border-b border-primary/15 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
              {selectedOfficeDisplay ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 mb-1 w-fit gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedOfficeKey(null)}
                >
                  <ArrowLeft className="size-4" />
                  Back to all offices
                </Button>
              ) : null}

              <div className="flex items-start gap-3">
                {patrolTypeImage ? (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-background/80 shadow-sm">
                    <Image
                      src={patrolTypeImage}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 object-contain"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 space-y-1">
                  <DialogTitle>
                    {selectedOfficeDisplay
                      ? `${selectedOfficeDisplay.label} · ${patrolTypeLabel}`
                      : patrolTypeLabel}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedOfficeDisplay
                      ? "Breakdown by station and unit"
                      : "Breakdown by provincial and regional office · tap an office for units"}
                  </DialogDescription>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryStat label="Patrolling" value={totalUnits} tone="primary" />
                <SummaryStat label="On duty" value={totalOnDuty} tone="emerald" />
              </div>
            </DialogHeader>

            <DialogBody className="pt-4">
              {selectedOfficeRow && selectedOfficeDisplay ? (
                unitRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No active units in this office
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Walang {patrolTypeLabel.toLowerCase()} sa {selectedOfficeDisplay.label} sa ngayon.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3">Unit / Station</th>
                          <th className="px-4 py-3 text-right">Patrolling</th>
                          <th className="px-4 py-3 text-right">On duty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unitRows.map((row, index) => {
                          const patrolling = row.counts[patrolTypeId] ?? 0
                          const onDuty = row.duty_counts[patrolTypeId] ?? 0

                          return (
                            <tr
                              key={row.unit}
                              className={cn(
                                "border-b last:border-0",
                                index % 2 === 1 && "bg-muted/10",
                              )}
                            >
                              <td className="px-4 py-3 font-medium">{row.unit}</td>
                              <td className="px-4 py-3 text-right">
                                <CountPill value={patrolling} tone="primary" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <CountPill value={onDuty} tone="emerald" />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-muted/30 font-semibold">
                          <td className="px-4 py-3">Total</td>
                          <td className="px-4 py-3 text-right tabular-nums text-primary">
                            {totalUnits.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {totalOnDuty.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )
              ) : officeRows.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">No active units right now</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Walang {patrolTypeLabel.toLowerCase()} na naka-live tracking sa ngayon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {officeRows.map((row) => {
                      const display = resolvePatrolOfficeDisplay(row.office)
                      const patrolling = row.counts[patrolTypeId] ?? 0
                      const onDuty = row.duty_counts[patrolTypeId] ?? 0
                      const unitCount = filterUnitsForType(row.units ?? [], patrolTypeId).length
                      const isClickable = unitCount > 0

                      const card = (
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                          <div className={cn("h-1 w-full", display.colorClass)} />
                          <div className="flex items-center gap-3 px-4 py-3">
                            <OfficeLogo
                              src={display.logo}
                              alt={display.label}
                              fallback={display.shortLabel}
                              colorClass={display.colorClass}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{display.label}</p>
                              {isClickable ? (
                                <p className="text-xs text-muted-foreground">
                                  {unitCount} unit{unitCount === 1 ? "" : "s"} · Tap to view
                                </p>
                              ) : null}
                            </div>
                            {isClickable ? (
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                            ) : null}
                          </div>
                          <div className="grid grid-cols-2 gap-px border-t bg-border">
                            <div className="bg-card px-4 py-3 text-center">
                              <p className="text-lg font-bold tabular-nums text-primary">
                                {patrolling.toLocaleString()}
                              </p>
                              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Patrolling
                              </p>
                            </div>
                            <div className="bg-card px-4 py-3 text-center">
                              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                {onDuty.toLocaleString()}
                              </p>
                              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                On duty
                              </p>
                            </div>
                          </div>
                        </div>
                      )

                      if (!isClickable) {
                        return <div key={display.key}>{card}</div>
                      }

                      return (
                        <button
                          key={display.key}
                          type="button"
                          className="w-full text-left transition-opacity hover:opacity-90"
                          onClick={() => handleOfficeClick(row.office, unitCount)}
                        >
                          {card}
                        </button>
                      )
                    })}
                  </div>

                  <div className="hidden overflow-hidden rounded-xl border md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3">Office</th>
                          <th className="px-4 py-3 text-right">Patrolling</th>
                          <th className="px-4 py-3 text-right">On duty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officeRows.map((row, index) => {
                          const display = resolvePatrolOfficeDisplay(row.office)
                          const patrolling = row.counts[patrolTypeId] ?? 0
                          const onDuty = row.duty_counts[patrolTypeId] ?? 0
                          const unitCount = filterUnitsForType(row.units ?? [], patrolTypeId).length
                          const isClickable = unitCount > 0

                          return (
                            <tr
                              key={display.key}
                              className={cn(
                                "border-b last:border-0 transition-colors",
                                index % 2 === 1 && "bg-muted/10",
                                isClickable && "cursor-pointer hover:bg-primary/5",
                              )}
                              onClick={
                                isClickable
                                  ? () => handleOfficeClick(row.office, unitCount)
                                  : undefined
                              }
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={cn(
                                      "h-8 w-1 shrink-0 rounded-full",
                                      display.colorClass,
                                    )}
                                  />
                                  <OfficeLogo
                                    src={display.logo}
                                    alt={display.label}
                                    fallback={display.shortLabel}
                                    colorClass={display.colorClass}
                                  />
                                  <div className="min-w-0">
                                    <span className="font-medium">{display.label}</span>
                                    {isClickable ? (
                                      <p className="text-xs text-muted-foreground">
                                        {unitCount} unit{unitCount === 1 ? "" : "s"}
                                      </p>
                                    ) : null}
                                  </div>
                                  {isClickable ? (
                                    <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <CountPill value={patrolling} tone="primary" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <CountPill value={onDuty} tone="emerald" />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-muted/30 font-semibold">
                          <td className="px-4 py-3">Total</td>
                          <td className="px-4 py-3 text-right tabular-nums text-primary">
                            {totalUnits.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {totalOnDuty.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
