"use client"

import { useState, useTransition } from "react"
import { GraduationCap, Loader2, type LucideIcon } from "lucide-react"

import { fetchSchoolingBreakdown } from "@/app/(dashboard)/actions"
import { SchoolingBreakdownSheet } from "@/components/dashboard/schooling-breakdown-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SchoolingAnalytics, SchoolingSummary, SchoolingTabKey } from "@/lib/schooling-types"
import { cn } from "@/lib/utils"

type SchoolingSectionProps = {
  tab: SchoolingTabKey
  summary: SchoolingSummary
  icon?: LucideIcon
  accentClassName?: string
  coursesDotClassName?: string
  subUnitDotClassName?: string
}

export function SchoolingSection({
  tab,
  summary,
  icon: Icon = GraduationCap,
  accentClassName = "h-full gap-0 overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-card text-indigo-700 dark:text-indigo-300 [&_[data-slot=card-description]]:text-indigo-700/90 dark:[&_[data-slot=card-description]]:text-indigo-300/90",
  coursesDotClassName = "bg-indigo-500",
  subUnitDotClassName = "bg-violet-500",
}: SchoolingSectionProps) {
  const [open, setOpen] = useState(false)
  const [breakdown, setBreakdown] = useState<SchoolingAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const courseCount = summary.courseStats?.length ?? 0
  const subUnitCount = summary.subUnitStats?.length ?? 0
  const isClickable = summary.dataReady && summary.total > 0 && (courseCount > 0 || subUnitCount > 0)

  function handleOpen() {
    if (!isClickable || isPending) return

    setError(null)
    startTransition(async () => {
      try {
        const data = await fetchSchoolingBreakdown(tab)
        setBreakdown(data)
        setOpen(true)
      } catch {
        setError("Hindi ma-load ang schooling breakdown. Subukan muli.")
      }
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setError(null)
    }
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
            <p className="text-sm font-medium text-foreground">Total Personnel on Schooling</p>
            {!summary.dataReady ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Walang data pa sa tab na ito.
              </p>
            ) : isClickable ? (
              <p className="mt-2 text-xs font-medium text-foreground/80">
                {isPending
                  ? "Loading breakdown..."
                  : "Tap to view courses and sub-unit breakdown"}
              </p>
            ) : null}
            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </button>

      {open && breakdown ? (
        <SchoolingBreakdownSheet
          data={breakdown}
          open={open}
          onOpenChange={handleOpenChange}
          coursesDotClassName={coursesDotClassName}
          subUnitDotClassName={subUnitDotClassName}
        />
      ) : null}
    </>
  )
}
