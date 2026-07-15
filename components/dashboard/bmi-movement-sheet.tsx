"use client"

import { useState, useTransition } from "react"
import { ArrowLeftIcon, ChevronRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { fetchBmiPersonTrendAction } from "@/app/(dashboard)/health-and-bmi/actions"
import { BmiTrendChart } from "@/components/dashboard/bmi-trend-chart"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { BmiMovementPerson, BmiTrendPoint } from "@/lib/health-types"

type BmiMovementSheetProps = {
  title: string | null
  description?: string
  personnel: BmiMovementPerson[]
  isLoading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatKg(value: number | null): string {
  return value != null ? `${value.toLocaleString()} kg` : "—"
}

function formatDelta(value: number | null) {
  if (value == null) return { text: "—", tone: "text-muted-foreground", Icon: null }
  if (value > 0)
    return { text: `+${value.toLocaleString()} kg`, tone: "text-red-600 dark:text-red-400", Icon: TrendingUpIcon }
  if (value < 0)
    return { text: `${value.toLocaleString()} kg`, tone: "text-emerald-600 dark:text-emerald-400", Icon: TrendingDownIcon }
  return { text: "±0 kg", tone: "text-muted-foreground", Icon: null }
}

function WeightCell({ person }: { person: BmiMovementPerson }) {
  const delta = formatDelta(person.deltaKg)
  return (
    <span className="inline-flex items-center gap-1.5">
      {delta.Icon ? <delta.Icon className="size-3.5" /> : null}
      <span className={`font-semibold tabular-nums ${delta.tone}`}>{delta.text}</span>
    </span>
  )
}

function CategoryChange({ person }: { person: BmiMovementPerson }) {
  if (!person.prevCategoryLabel && !person.currCategoryLabel) return <span>—</span>
  if (person.prevCategoryLabel === person.currCategoryLabel) {
    return <span className="text-muted-foreground">{person.currCategoryLabel ?? "—"}</span>
  }
  return (
    <span className="text-muted-foreground">
      {person.prevCategoryLabel ?? "—"}
      <span className="mx-1">→</span>
      <span className="font-medium text-foreground">{person.currCategoryLabel ?? "—"}</span>
    </span>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function BmiMovementSheet({
  title,
  description,
  personnel,
  isLoading = false,
  open,
  onOpenChange,
}: BmiMovementSheetProps) {
  const [selected, setSelected] = useState<BmiMovementPerson | null>(null)
  const [trend, setTrend] = useState<BmiTrendPoint[]>([])
  const [isTrendPending, startTrend] = useTransition()

  function openTrend(person: BmiMovementPerson) {
    setSelected(person)
    setTrend([])
    startTrend(async () => {
      try {
        const points = await fetchBmiPersonTrendAction(person.key, person.filterToken)
        setTrend(points)
      } catch {
        setTrend([])
      }
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelected(null)
      setTrend([])
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {selected ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-8 gap-1 px-2"
                  onClick={() => {
                    setSelected(null)
                    setTrend([])
                  }}
                >
                  <ArrowLeftIcon className="size-4" />
                  Back
                </Button>
              </div>
              <DialogTitle className="pt-1">
                {selected.rank} {selected.name}
              </DialogTitle>
              <DialogDescription>
                {selected.unit} · Weight & BMI trend across recorded months
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {isTrendPending ? (
                <Skeleton className="h-[260px] w-full rounded-lg" />
              ) : (
                <>
                  <BmiTrendChart points={trend} />
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-5 rounded bg-sky-500" />
                      Weight (kg)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-5 rounded border-t-2 border-dashed border-rose-500" />
                      BMI
                    </span>
                  </div>
                </>
              )}
            </DialogBody>
          </>
        ) : title ? (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {isLoading
                  ? "Loading personnel list…"
                  : `${personnel.length.toLocaleString()} personnel${
                      description ? ` · ${description}` : ""
                    }`}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {isLoading ? (
                <LoadingRows />
              ) : personnel.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No personnel in this list.
                </p>
              ) : (
                <>
                  <div className="space-y-2.5 md:hidden">
                    {personnel.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => openTrend(person)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold leading-snug">
                            {person.rank} {person.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{person.unit}</p>
                          <div className="mt-1.5 flex items-center gap-2 text-xs">
                            <WeightCell person={person} />
                            <span className="text-muted-foreground">·</span>
                            <CategoryChange person={person} />
                          </div>
                        </div>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Rank</th>
                          <th className="pb-3 px-3 font-medium">Name</th>
                          <th className="pb-3 px-3 font-medium">Unit</th>
                          <th className="pb-3 px-3 font-medium">Weight change</th>
                          <th className="pb-3 px-3 font-medium">Category</th>
                          <th className="pb-3 pl-3" aria-label="View trend" />
                        </tr>
                      </thead>
                      <tbody>
                        {personnel.map((person) => (
                          <tr
                            key={person.id}
                            onClick={() => openTrend(person)}
                            className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent"
                          >
                            <td className="py-3 pr-4 font-medium">{person.rank}</td>
                            <td className="px-3 py-3">{person.name}</td>
                            <td className="px-3 py-3 text-muted-foreground">{person.unit}</td>
                            <td className="px-3 py-3">
                              <span className="whitespace-nowrap text-xs text-muted-foreground">
                                {formatKg(person.prevWeightKg)} → {formatKg(person.currWeightKg)}
                              </span>
                              <div className="mt-0.5">
                                <WeightCell person={person} />
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs">
                              <CategoryChange person={person} />
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <ChevronRightIcon className="ml-auto size-4 text-muted-foreground" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Tap a name to see that person&apos;s interactive weight &amp; BMI trend.
                  </p>
                </>
              )}
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
