"use client"

import { useState } from "react"
import { GraduationCap, type LucideIcon } from "lucide-react"

import { SchoolingBreakdownSheet } from "@/components/dashboard/schooling-breakdown-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SchoolingAnalytics } from "@/lib/schooling-types"
import { cn } from "@/lib/utils"

type SchoolingSectionProps = {
  data: SchoolingAnalytics
  icon?: LucideIcon
  accentClassName?: string
  coursesDotClassName?: string
  subUnitDotClassName?: string
}

export function SchoolingSection({
  data,
  icon: Icon = GraduationCap,
  accentClassName = "h-full gap-0 overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-card text-indigo-700 dark:text-indigo-300 [&_[data-slot=card-description]]:text-indigo-700/90 dark:[&_[data-slot=card-description]]:text-indigo-300/90",
  coursesDotClassName = "bg-indigo-500",
  subUnitDotClassName = "bg-violet-500",
}: SchoolingSectionProps) {
  const [open, setOpen] = useState(false)
  const isClickable =
    data.dataReady &&
    data.records.length > 0 &&
    (data.courseStats.length > 0 || data.subUnitStats.length > 0)

  return (
    <>
      <button
        type="button"
        disabled={!isClickable}
        onClick={() => setOpen(true)}
        className={cn(
          "h-full w-full text-left",
          isClickable &&
            "cursor-pointer transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !isClickable && "cursor-default",
        )}
      >
        <Card className={cn("h-full", accentClassName)}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className="size-5 shrink-0" aria-hidden />
              <CardDescription className="font-medium">{data.title}</CardDescription>
            </div>
            <CardTitle className="text-4xl font-bold tabular-nums sm:text-5xl">
              {data.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">Total Personnel on Schooling</p>
            {!data.dataReady ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Walang data pa sa tab na ito.
              </p>
            ) : isClickable ? (
              <p className="mt-2 text-xs font-medium text-foreground/80">
                Tap to view courses and sub-unit breakdown
              </p>
            ) : null}
          </CardContent>
        </Card>
      </button>

      <SchoolingBreakdownSheet
        data={data}
        open={open}
        onOpenChange={setOpen}
        coursesDotClassName={coursesDotClassName}
        subUnitDotClassName={subUnitDotClassName}
      />
    </>
  )
}
