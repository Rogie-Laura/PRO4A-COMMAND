"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SchoolingRecord } from "@/lib/schooling-types"

type SchoolingDetailSheetProps = {
  groupLabel: string | null
  records: SchoolingRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatName(record: SchoolingRecord) {
  const given = `${record.firstName} ${record.middleName}`.trim()
  return [record.rank, record.lastName, given].filter(Boolean).join(" ")
}

function PersonCard({ record }: { record: SchoolingRecord }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-semibold leading-snug">{formatName(record)}</p>
      <dl className="mt-3 grid gap-2 text-sm">
        <DetailRow label="Badge No." value={record.badgeNumber || "—"} />
        <DetailRow label="Sub-Unit" value={record.subUnit || "—"} />
        <DetailRow label="Unit/Office" value={record.unitOffice || "—"} />
        <DetailRow label="Course & School" value={record.courseSchool || "—"} />
        <DetailRow label="Effective Date" value={record.effectiveDate || "—"} />
        <DetailRow label="Authority" value={record.authority || "—"} />
      </dl>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
    </div>
  )
}

export function SchoolingDetailSheet({
  groupLabel,
  records,
  open,
  onOpenChange,
}: SchoolingDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {groupLabel && (
          <>
            <DialogHeader>
              <DialogTitle>{groupLabel}</DialogTitle>
              <DialogDescription>
                {records.length.toLocaleString()} personnel on schooling list
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-3 md:hidden">
                {records.map((record) => (
                  <PersonCard key={record.no} record={record} />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Badge No.</th>
                      <th className="pb-3 pr-4 font-medium">Unit/Office</th>
                      <th className="pb-3 pr-4 font-medium">Course & School</th>
                      <th className="pb-3 pr-4 font-medium">Effective Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.no} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{formatName(record)}</td>
                        <td className="py-3 pr-4 tabular-nums">{record.badgeNumber || "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {record.unitOffice || "—"}
                        </td>
                        <td className="py-3 pr-4">{record.courseSchool || "—"}</td>
                        <td className="py-3 pr-4">{record.effectiveDate || "—"}</td>
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
