"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RankTenurePersonDetail } from "@/lib/personnel-types"

type RankTenureDetailSheetProps = {
  rank: string | null
  bracketLabel: string | null
  personnel: RankTenurePersonDetail[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PersonCard({ person }: { person: RankTenurePersonDetail }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{person.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {person.rank} · {person.badgeNumber}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
          {person.yearsInRank} yrs
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Last Promoted</dt>
          <dd className="text-right font-medium tabular-nums">
            {person.lastPromotionDate || "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Office</dt>
          <dd className="text-right font-medium">{person.office}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Unit</dt>
          <dd className="text-right font-medium">{person.unit}</dd>
        </div>
      </dl>
    </div>
  )
}

export function RankTenureDetailSheet({
  rank,
  bracketLabel,
  personnel,
  open,
  onOpenChange,
}: RankTenureDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {rank && bracketLabel && (
          <>
            <DialogHeader>
              <DialogTitle>
                {rank} · {bracketLabel}
              </DialogTitle>
              <DialogDescription>
                {personnel.length.toLocaleString()} personnel with tenure in this bracket
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-3 md:hidden">
                {personnel.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 px-3 font-medium">Rank</th>
                      <th className="pb-3 px-3 font-medium">Badge No</th>
                      <th className="pb-3 px-3 font-medium">Last Promoted</th>
                      <th className="pb-3 px-3 font-medium">Office</th>
                      <th className="pb-3 px-3 font-medium">Unit</th>
                      <th className="pb-3 pl-3 text-center font-medium">Yrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnel.map((person) => (
                      <tr key={person.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{person.name}</td>
                        <td className="px-3 py-3 text-muted-foreground">{person.rank}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">
                          {person.badgeNumber}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap tabular-nums text-muted-foreground">
                          {person.lastPromotionDate || "—"}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{person.office}</td>
                        <td className="px-3 py-3 text-muted-foreground">{person.unit}</td>
                        <td className="py-3 pl-3 text-center font-semibold tabular-nums text-primary">
                          {person.yearsInRank}
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
