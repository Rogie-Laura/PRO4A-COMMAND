"use client"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { BmiPersonnelDetail } from "@/lib/health-types"

type BmiPersonnelSheetProps = {
  categoryLabel: string | null
  personnel: BmiPersonnelDetail[]
  isLoading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Overrides the default "N personnel in this BMI category" description. */
  describe?: (count: number) => string
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

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function BmiPersonnelSheet({
  categoryLabel,
  personnel,
  isLoading = false,
  open,
  onOpenChange,
  describe,
}: BmiPersonnelSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {categoryLabel && (
          <>
            <DialogHeader>
              <DialogTitle>{categoryLabel}</DialogTitle>
              <DialogDescription>
                {isLoading
                  ? "Loading personnel list…"
                  : describe
                    ? describe(personnel.length)
                    : `${personnel.length.toLocaleString()} personnel in this BMI category`}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {isLoading ? (
                <LoadingRows />
              ) : personnel.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Walang personnel records para sa category na ito.
                </p>
              ) : (
                <>
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
                </>
              )}
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
