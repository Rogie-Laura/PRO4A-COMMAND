"use client"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { FirearmsUnitBreakdownItem } from "@/lib/firearms-types"

type FirearmsUnitStatusDialogProps = {
  unit: FirearmsUnitBreakdownItem | null
  categoryLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_ITEMS = [
  { key: "svc", label: "Serviceable", shortLabel: "SVC", colorClass: "bg-emerald-500" },
  { key: "unsvc", label: "Unserviceable", shortLabel: "UNSVC", colorClass: "bg-amber-500" },
  { key: "ber", label: "Beyond Economic Repair", shortLabel: "BER", colorClass: "bg-rose-500" },
] as const

export function FirearmsUnitStatusDialog({
  unit,
  categoryLabel,
  open,
  onOpenChange,
}: FirearmsUnitStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {unit ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <OfficeLogo
                  src={unit.logo}
                  alt={unit.label}
                  fallback={unit.shortLabel}
                  colorClass={unit.colorClass}
                />
                <div className="min-w-0">
                  <DialogTitle>{unit.label}</DialogTitle>
                  <DialogDescription>
                    {categoryLabel} · Status breakdown
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-3">
                {STATUS_ITEMS.map((item) => {
                  const count = unit.status[item.key]

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className={`size-2.5 shrink-0 rounded-full ${item.colorClass}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.shortLabel}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-lg font-bold tabular-nums text-primary">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm font-semibold">
                <span>Total Firearms</span>
                <span className="tabular-nums text-primary">{unit.total.toLocaleString()}</span>
              </div>
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
