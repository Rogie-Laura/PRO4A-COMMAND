"use client"

import { useState } from "react"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PpoLeadershipTenureCard, PpoTenurePerson } from "@/lib/ppo-leadership-tenure"
import { cn } from "@/lib/utils"

type PpoLeadershipTenureSectionProps = {
  cards: PpoLeadershipTenureCard[]
}

function TenureTable({
  provincialDirector,
  chiefsOfPolice,
}: {
  provincialDirector: PpoTenurePerson | null
  chiefsOfPolice: PpoTenurePerson[]
}) {
  const rows: { section: string; person: PpoTenurePerson }[] = []

  if (provincialDirector) {
    rows.push({ section: "Provincial Director", person: provincialDirector })
  }

  for (const person of chiefsOfPolice) {
    rows.push({ section: "Chief of Police", person })
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Walang PD / COP records para sa PPO na ito.</p>
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border/60">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Rank / Name</th>
            <th className="px-3 py-2 font-medium">Designation</th>
            <th className="px-3 py-2 font-medium">Office</th>
            <th className="px-3 py-2 font-medium">Unit / Station</th>
            <th className="px-3 py-2 font-medium">Designation Date</th>
            <th className="px-3 py-2 font-medium">Tenure</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ section, person }) => (
            <tr
              key={person.id}
              className={cn(
                "border-b border-border/40",
                person.role === "provincial-director" && "bg-amber-500/5",
              )}
            >
              <td className="px-3 py-2 align-top">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    person.role === "provincial-director"
                      ? "border-amber-500/40 text-amber-700 dark:text-amber-300"
                      : "border-sky-500/40 text-sky-700 dark:text-sky-300",
                  )}
                >
                  {section}
                </Badge>
              </td>
              <td className="px-3 py-2 align-top">
                <p className="font-medium">{person.rank}</p>
                <p className="text-muted-foreground">{person.name}</p>
              </td>
              <td className="px-3 py-2 align-top">{person.designation || "—"}</td>
              <td className="px-3 py-2 align-top">{person.office}</td>
              <td className="px-3 py-2 align-top">{person.unitStation}</td>
              <td className="px-3 py-2 align-top tabular-nums">{person.designationDateLabel}</td>
              <td className="px-3 py-2 align-top font-medium tabular-nums">{person.tenureLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PpoLeadershipTenureSection({ cards }: PpoLeadershipTenureSectionProps) {
  const [selected, setSelected] = useState<PpoLeadershipTenureCard | null>(null)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">PPO Leadership Tenure</CardTitle>
          <CardDescription>
            Provincial Directors and Chiefs of Police — click a PPO to view designation date and
            tenure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelected(card)}
                className="rounded-xl border bg-muted/20 p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2.5">
                  <OfficeLogo
                    src={card.logo}
                    alt={card.label}
                    fallback={card.shortLabel}
                    colorClass={card.colorClass}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{card.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {card.chiefCount.toLocaleString()} COP
                      {card.chiefCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 border-t border-border/50 pt-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Provincial Director
                  </p>
                  {card.provincialDirector ? (
                    <>
                      <p className="truncate text-sm font-medium">
                        {card.provincialDirector.rank} {card.provincialDirector.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {card.provincialDirector.tenureLabel}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Vacant / not found</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selected?.label ?? "PPO"} leadership tenure</DialogTitle>
            <DialogDescription>
              Provincial Director first, then Chiefs of Police sorted by highest tenure
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selected ? (
              <TenureTable
                provincialDirector={selected.provincialDirector}
                chiefsOfPolice={selected.chiefsOfPolice}
              />
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
