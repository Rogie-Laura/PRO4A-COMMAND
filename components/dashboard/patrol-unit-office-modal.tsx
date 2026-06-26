"use client"

import Image from "next/image"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OfficeLogo } from "@/components/dashboard/office-logo"
import type { PatrolUnitTypeId } from "@/lib/patrol-intervention-config"
import { resolvePatrolOfficeDisplay, sortPatrolOfficeRows } from "@/lib/patrol-office-map"
import type { PatrolOfficeBreakdownRow } from "@/lib/patrollers-counts"
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

function CountBadge({
  value,
  label,
  tone = "primary",
}: {
  value: number
  label: string
  tone?: "primary" | "emerald"
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-lg font-bold tabular-nums leading-none",
          tone === "primary" ? "text-primary" : "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

export function PatrolUnitOfficeModal({
  patrolTypeId,
  patrolTypeLabel,
  patrolTypeImage,
  officeBreakdown,
  open,
  onOpenChange,
}: PatrolUnitOfficeModalProps) {
  const rows =
    patrolTypeId === null
      ? []
      : sortPatrolOfficeRows(officeBreakdown).filter(
          (row) => row.counts[patrolTypeId] > 0 || row.duty_counts[patrolTypeId] > 0,
        )

  const totalUnits =
    patrolTypeId === null
      ? 0
      : rows.reduce((sum, row) => sum + (row.counts[patrolTypeId] ?? 0), 0)
  const totalOnDuty =
    patrolTypeId === null
      ? 0
      : rows.reduce((sum, row) => sum + (row.duty_counts[patrolTypeId] ?? 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {patrolTypeLabel && patrolTypeId ? (
          <>
            <DialogHeader className="border-b border-primary/15 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
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
                  <DialogTitle>{patrolTypeLabel}</DialogTitle>
                  <DialogDescription>
                    Breakdown by provincial and regional office
                  </DialogDescription>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryStat label="Patrolling" value={totalUnits} tone="primary" />
                <SummaryStat label="On duty" value={totalOnDuty} tone="emerald" />
              </div>
            </DialogHeader>

            <DialogBody className="pt-4">
              {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No active units right now
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Walang {patrolTypeLabel.toLowerCase()} na naka-live tracking sa ngayon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {rows.map((row) => {
                      const display = resolvePatrolOfficeDisplay(row.office)
                      const patrolling = row.counts[patrolTypeId] ?? 0
                      const onDuty = row.duty_counts[patrolTypeId] ?? 0

                      return (
                        <div
                          key={display.key}
                          className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
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
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-px border-t bg-border">
                            <div className="bg-card px-4 py-3">
                              <CountBadge value={patrolling} label="Patrolling" tone="primary" />
                            </div>
                            <div className="bg-card px-4 py-3">
                              <CountBadge value={onDuty} label="On duty" tone="emerald" />
                            </div>
                          </div>
                        </div>
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
                        {rows.map((row, index) => {
                          const display = resolvePatrolOfficeDisplay(row.office)
                          const patrolling = row.counts[patrolTypeId] ?? 0
                          const onDuty = row.duty_counts[patrolTypeId] ?? 0

                          return (
                            <tr
                              key={display.key}
                              className={cn(
                                "border-b last:border-0 transition-colors hover:bg-muted/30",
                                index % 2 === 1 && "bg-muted/10",
                              )}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={cn("h-8 w-1 shrink-0 rounded-full", display.colorClass)}
                                  />
                                  <OfficeLogo
                                    src={display.logo}
                                    alt={display.label}
                                    fallback={display.shortLabel}
                                    colorClass={display.colorClass}
                                  />
                                  <span className="font-medium">{display.label}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="inline-flex min-w-10 justify-end rounded-md bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
                                  {patrolling.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="inline-flex min-w-10 justify-end rounded-md bg-emerald-500/10 px-2.5 py-1 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                  {onDuty.toLocaleString()}
                                </span>
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
