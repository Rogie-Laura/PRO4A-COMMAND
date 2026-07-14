"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IctOfficeCards } from "@/components/dashboard/ict-office-cards"
import { ICT_STATUS_VARIANTS, type IctStatusVariant } from "@/components/dashboard/ict-status-card"
import type { IctStatusSection } from "@/lib/ict-equipment-types"

type IctOfficeBreakdownSheetProps = {
  variant: IctStatusVariant | null
  section: IctStatusSection | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IctOfficeBreakdownSheet({
  variant,
  section,
  open,
  onOpenChange,
}: IctOfficeBreakdownSheetProps) {
  if (!variant || !section) return null

  const styles = ICT_STATUS_VARIANTS[variant]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{section.label}</DialogTitle>
          <DialogDescription>
            {section.breakdown.total.toLocaleString()} devices · breakdown by PPO
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">2025 & Below</p>
              <p className="text-xl font-bold tabular-nums">
                {section.breakdown.year2025Below.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">As of January 2026</p>
              <p className="text-xl font-bold tabular-nums">
                {section.breakdown.asOfJanuary2026.toLocaleString()}
              </p>
            </div>
          </div>

          <IctOfficeCards offices={section.offices} countClassName={styles.count} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
