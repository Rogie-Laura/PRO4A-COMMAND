"use client"

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

type PatrolUnitOfficeModalProps = {
  patrolTypeId: PatrolUnitTypeId | null
  patrolTypeLabel: string | null
  officeBreakdown: PatrolOfficeBreakdownRow[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatrolUnitOfficeModal({
  patrolTypeId,
  patrolTypeLabel,
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
      <DialogContent>
        {patrolTypeLabel && patrolTypeId ? (
          <>
            <DialogHeader>
              <DialogTitle>{patrolTypeLabel} by office</DialogTitle>
              <DialogDescription>
                {totalUnits.toLocaleString()} active unit{totalUnits === 1 ? "" : "s"} ·{" "}
                {totalOnDuty.toLocaleString()} personnel on duty
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active {patrolTypeLabel.toLowerCase()} units right now.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="hidden grid-cols-[minmax(0,1fr)_5rem_5rem] gap-3 border-b pb-2 text-xs font-medium text-muted-foreground sm:grid">
                    <span>Office</span>
                    <span className="text-right">Patrolling</span>
                    <span className="text-right">On duty</span>
                  </div>

                  {rows.map((row) => {
                    const display = resolvePatrolOfficeDisplay(row.office)
                    const patrolling = row.counts[patrolTypeId] ?? 0
                    const onDuty = row.duty_counts[patrolTypeId] ?? 0

                    return (
                      <div
                        key={display.key}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <OfficeLogo
                            src={display.logo}
                            alt={display.label}
                            fallback={display.shortLabel}
                            colorClass={display.colorClass}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{display.label}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              {patrolling} patrolling · {onDuty} on duty
                            </p>
                          </div>
                        </div>

                        <div className="hidden shrink-0 grid-cols-2 gap-6 text-right sm:grid">
                          <span className="text-sm font-bold tabular-nums text-primary">
                            {patrolling.toLocaleString()}
                          </span>
                          <span className="text-sm font-bold tabular-nums text-foreground">
                            {onDuty.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
