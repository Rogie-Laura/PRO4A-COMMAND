"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { RankTenurePersonDetail } from "@/lib/personnel-types"

type RankTenureDetailSheetProps = {
  rank: string | null
  bracketLabel: string | null
  personnel: RankTenurePersonDetail[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatPromotionYear(date: string) {
  const parts = date.trim().split("/")
  if (parts.length === 3) return parts[2]
  return date || "—"
}

export function RankTenureDetailSheet({
  rank,
  bracketLabel,
  personnel,
  open,
  onOpenChange,
}: RankTenureDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {rank && bracketLabel && (
          <>
            <SheetHeader className="border-b pb-4">
              <SheetTitle>
                {rank} · {bracketLabel}
              </SheetTitle>
              <SheetDescription>
                {personnel.length.toLocaleString()} personnel with tenure in this bracket
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Name</th>
                    <th className="pb-2 px-2 font-medium">Last Promoted</th>
                    <th className="pb-2 px-2 font-medium">Office</th>
                    <th className="pb-2 px-2 font-medium">Unit</th>
                    <th className="pb-2 pl-2 text-center font-medium">Yrs</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map((person) => (
                    <tr key={person.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-3 text-xs font-medium sm:text-sm">
                        {person.name}
                      </td>
                      <td className="px-2 py-2.5 tabular-nums text-muted-foreground">
                        {formatPromotionYear(person.lastPromotionDate)}
                      </td>
                      <td className="px-2 py-2.5 text-xs text-muted-foreground">{person.office}</td>
                      <td className="px-2 py-2.5 text-xs text-muted-foreground">{person.unit}</td>
                      <td className="py-2.5 pl-2 text-center font-semibold tabular-nums text-primary">
                        {person.yearsInRank}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
