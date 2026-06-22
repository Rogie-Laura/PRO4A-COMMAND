"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TRAINING_STATUS_LABELS, formatMonthLabel } from "@/lib/trainings-config"
import type { TrainingRecord } from "@/lib/trainings-types"

type TrainingsDetailSheetProps = {
  statusLabel: string | null
  records: TrainingRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TrainingCard({ record }: { record: TrainingRecord }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-semibold leading-snug">{record.activity}</p>
      <dl className="mt-3 grid gap-2 text-sm">
        <DetailRow label="No. of Class" value={String(record.classCount || "—")} />
        <DetailRow label="Month" value={formatMonthLabel(record.month)} />
        <DetailRow label="Schedule" value={record.dateOpening || record.proposedSchedule || "—"} />
        <DetailRow label="Venue" value={record.venue || "—"} />
        <DetailRow label="Mode" value={record.mode || "—"} />
        <DetailRow label="OPR" value={record.opr || "—"} />
        <DetailRow
          label="Participants"
          value={record.totalParticipants > 0 ? record.totalParticipants.toLocaleString() : "—"}
        />
        <DetailRow label="Status" value={TRAINING_STATUS_LABELS[record.status]} />
      </dl>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

export function TrainingsDetailSheet({
  statusLabel,
  records,
  open,
  onOpenChange,
}: TrainingsDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {statusLabel && (
          <>
            <DialogHeader>
              <DialogTitle>{statusLabel}</DialogTitle>
              <DialogDescription>
                {records.reduce((sum, record) => sum + (record.classCount || 1), 0).toLocaleString()}{" "}
                classes · {records.length.toLocaleString()} training
                {records.length === 1 ? "" : "s"}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-3 md:hidden">
                {records.map((record) => (
                  <TrainingCard key={record.id} record={record} />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Training</th>
                      <th className="pb-3 pr-4 font-medium">Classes</th>
                      <th className="pb-3 pr-4 font-medium">Month</th>
                      <th className="pb-3 pr-4 font-medium">Schedule</th>
                      <th className="pb-3 pr-4 font-medium">Venue</th>
                      <th className="pb-3 pr-4 font-medium">Mode</th>
                      <th className="pb-3 pr-4 font-medium text-right">Participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 align-top font-medium">{record.activity}</td>
                        <td className="py-3 pr-4 align-top tabular-nums">{record.classCount || "—"}</td>
                        <td className="py-3 pr-4 align-top">{formatMonthLabel(record.month)}</td>
                        <td className="py-3 pr-4 align-top">
                          {record.dateOpening || record.proposedSchedule || "—"}
                        </td>
                        <td className="py-3 pr-4 align-top">{record.venue || "—"}</td>
                        <td className="py-3 pr-4 align-top">{record.mode || "—"}</td>
                        <td className="py-3 pr-4 align-top text-right tabular-nums">
                          {record.totalParticipants > 0
                            ? record.totalParticipants.toLocaleString()
                            : "—"}
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
