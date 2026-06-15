"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminHoldingRecord } from "@/lib/admin-holding-types"

type AdminHoldingDetailSheetProps = {
  statusLabel: string | null
  records: AdminHoldingRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatName(record: AdminHoldingRecord) {
  const given = `${record.firstName} ${record.middleName}`.trim()
  return [record.rank, record.lastName, given].filter(Boolean).join(" ")
}

function PersonCard({ record }: { record: AdminHoldingRecord }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-semibold leading-snug">{formatName(record)}</p>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Badge No.</dt>
          <dd className="text-right font-medium tabular-nums">{record.badgeNumber || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Unit</dt>
          <dd className="text-right font-medium">{record.formerUnit || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-right font-medium">{record.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Remarks</dt>
          <dd className="text-right font-medium">{record.remarks || "—"}</dd>
        </div>
      </dl>
    </div>
  )
}

export function AdminHoldingDetailSheet({
  statusLabel,
  records,
  open,
  onOpenChange,
}: AdminHoldingDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {statusLabel && (
          <>
            <DialogHeader>
              <DialogTitle>{statusLabel}</DialogTitle>
              <DialogDescription>
                {records.length.toLocaleString()} personnel in this admin holding status
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-3 md:hidden">
                {records.map((record) => (
                  <PersonCard key={record.no} record={record} />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 px-3 font-medium">Badge No.</th>
                      <th className="pb-3 px-3 font-medium">Unit</th>
                      <th className="pb-3 px-3 font-medium">Status</th>
                      <th className="pb-3 pl-3 font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.no} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{formatName(record)}</td>
                        <td className="px-3 py-3 tabular-nums">{record.badgeNumber || "—"}</td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {record.formerUnit || "—"}
                        </td>
                        <td className="px-3 py-3">{record.status}</td>
                        <td className="py-3 pl-3 text-muted-foreground">
                          {record.remarks || "—"}
                        </td>
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
