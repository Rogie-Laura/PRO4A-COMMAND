"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DetailedPersonnelRecordWithSource } from "@/lib/detailed-personnel-status"

type DetailedPersonnelStatusDetailSheetProps = {
  title: string | null
  description: string
  records: DetailedPersonnelRecordWithSource[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatRankName(record: DetailedPersonnelRecordWithSource) {
  const given = `${record.firstName} ${record.middleName}`.trim()
  const name = [record.lastName, given].filter(Boolean).join(", ")
  return record.rank ? `${record.rank} ${name}` : name
}

export function DetailedPersonnelStatusDetailSheet({
  title,
  description,
  records,
  open,
  onOpenChange,
}: DetailedPersonnelStatusDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {title && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Rank / Name</th>
                      <th className="pb-3 pr-4 font-medium">Badge</th>
                      <th className="pb-3 pr-4 font-medium">End Date</th>
                      <th className="pb-3 pr-4 font-medium">Unit From</th>
                      <th className="pb-3 pr-4 font-medium">Detailed At</th>
                      <th className="pb-3 pr-4 font-medium">Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.recordKey} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{formatRankName(record)}</td>
                        <td className="py-3 pr-4 tabular-nums">{record.badgeNumber || "—"}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">{record.endDate || "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {record.unitFrom || "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{record.unitTo || "—"}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">{record.daysRemaining || "—"}</td>
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
