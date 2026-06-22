"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DetailedPersonnelRecord } from "@/lib/detailed-personnel-types"

type DetailedPersonnelTabDetailSheetProps = {
  title: string | null
  records: DetailedPersonnelRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatRankName(record: DetailedPersonnelRecord) {
  const given = `${record.firstName} ${record.middleName}`.trim()
  const name = [record.lastName, given].filter(Boolean).join(", ")
  return record.rank ? `${record.rank} ${name}` : name
}

function recordKey(record: DetailedPersonnelRecord) {
  return `${record.no}-${record.badgeNumber}-${record.lastName}`
}

export function DetailedPersonnelTabDetailSheet({
  title,
  records,
  open,
  onOpenChange,
}: DetailedPersonnelTabDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {title && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {records.length.toLocaleString()} personnel on detail assignment
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Rank / Name</th>
                      <th className="pb-3 pr-4 font-medium">Badge</th>
                      <th className="pb-3 pr-4 font-medium">Unit From</th>
                      <th className="pb-3 pr-4 font-medium">Detailed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={recordKey(record)} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{formatRankName(record)}</td>
                        <td className="py-3 pr-4 tabular-nums">{record.badgeNumber || "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {record.unitFrom || "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{record.unitTo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
