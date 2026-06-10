"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { BmiPersonnelDetail } from "@/lib/health-types"

type BmiPersonnelSheetProps = {
  categoryLabel: string | null
  personnel: BmiPersonnelDetail[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PersonCard({ person }: { person: BmiPersonnelDetail }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-semibold leading-snug">
        {person.rank} {person.name}
      </p>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Unit</dt>
          <dd className="text-right font-medium">{person.unit}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Age</dt>
          <dd className="text-right font-medium tabular-nums">{person.age}</dd>
        </div>
      </dl>
    </div>
  )
}

export function BmiPersonnelSheet({
  categoryLabel,
  personnel,
  open,
  onOpenChange,
}: BmiPersonnelSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {categoryLabel && (
          <>
            <DialogHeader>
              <DialogTitle>{categoryLabel}</DialogTitle>
              <DialogDescription>
                {personnel.length.toLocaleString()} personnel in this BMI category
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-3 md:hidden">
                {personnel.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Rank</th>
                      <th className="pb-3 px-3 font-medium">Name</th>
                      <th className="pb-3 px-3 font-medium">Unit</th>
                      <th className="pb-3 pl-3 text-center font-medium">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnel.map((person) => (
                      <tr key={person.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{person.rank}</td>
                        <td className="px-3 py-3">{person.name}</td>
                        <td className="px-3 py-3 text-muted-foreground">{person.unit}</td>
                        <td className="py-3 pl-3 text-center font-semibold tabular-nums text-primary">
                          {person.age}
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
