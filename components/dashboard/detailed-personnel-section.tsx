"use client"

import { useState, useTransition } from "react"
import { ArrowRightLeft, Loader2, type LucideIcon } from "lucide-react"

import { fetchDetailedPersonnelTab } from "@/app/(dashboard)/actions"
import { DetailedPersonnelTabDetailSheet } from "@/components/dashboard/detailed-personnel-tab-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  DetailedPersonnelRecord,
  DetailedPersonnelSummary,
  DetailedPersonnelTabKey,
} from "@/lib/detailed-personnel-types"
import { cn } from "@/lib/utils"

type DetailedPersonnelSectionProps = {
  tab: DetailedPersonnelTabKey
  summary: DetailedPersonnelSummary
  icon?: LucideIcon
  accentClassName?: string
}

export function DetailedPersonnelSection({
  tab,
  summary,
  icon: Icon = ArrowRightLeft,
  accentClassName = "h-full gap-0 overflow-hidden border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card text-sky-700 dark:text-sky-300 [&_[data-slot=card-description]]:text-sky-700/90 dark:[&_[data-slot=card-description]]:text-sky-300/90",
}: DetailedPersonnelSectionProps) {
  const [open, setOpen] = useState(false)
  const [records, setRecords] = useState<DetailedPersonnelRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isClickable = summary.dataReady && summary.total > 0

  function handleOpen() {
    if (!isClickable || isPending) return

    setError(null)
    startTransition(async () => {
      try {
        const list = await fetchDetailedPersonnelTab(tab)
        setRecords(list)
        setOpen(true)
      } catch {
        setError("Hindi ma-load ang personnel list. Subukan muli.")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        disabled={!isClickable || isPending}
        onClick={handleOpen}
        className={cn(
          "h-full w-full text-left",
          isClickable &&
            !isPending &&
            "cursor-pointer transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          (!isClickable || isPending) && "cursor-default",
        )}
      >
        <Card className={cn("h-full", accentClassName)}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {isPending ? (
                <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Icon className="size-5 shrink-0" aria-hidden />
              )}
              <CardDescription className="font-medium">{summary.title}</CardDescription>
            </div>
            <CardTitle className="text-4xl font-bold tabular-nums sm:text-5xl">
              {summary.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">Total Personnel on Detail</p>
            {!summary.dataReady ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Walang data pa sa tab na ito.
              </p>
            ) : isClickable ? (
              <p className="mt-2 text-xs font-medium text-foreground/80">
                {isPending ? "Loading personnel list..." : "Tap to view personnel list"}
              </p>
            ) : null}
            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </button>

      {open ? (
        <DetailedPersonnelTabDetailSheet
          title={summary.title}
          records={records}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  )
}
