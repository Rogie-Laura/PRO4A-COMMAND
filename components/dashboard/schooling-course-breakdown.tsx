"use client"

import { useMemo, useState } from "react"

import { SchoolingDetailSheet } from "@/components/dashboard/schooling-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CountItem } from "@/lib/personnel-types"
import type { SchoolingRecord } from "@/lib/schooling-types"
import { cn } from "@/lib/utils"

type SchoolingCourseBreakdownProps = {
  items: CountItem[]
  records: SchoolingRecord[]
  breakdownTitle?: string
}

type SelectedCourse = {
  label: string
  records: SchoolingRecord[]
}

export function SchoolingCourseBreakdown({
  items,
  records,
  breakdownTitle = "Courses Enrolled",
}: SchoolingCourseBreakdownProps) {
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null)
  const [open, setOpen] = useState(false)

  const recordsByCourse = useMemo(() => {
    const map = new Map<string, SchoolingRecord[]>()

    for (const record of records) {
      const list = map.get(record.course) ?? []
      list.push(record)
      map.set(record.course, list)
    }

    return map
  }, [records])

  function handleCourseClick(item: CountItem) {
    if (item.count === 0) return

    const courseRecords = recordsByCourse.get(item.name) ?? []
    if (courseRecords.length === 0) return

    setSelectedCourse({
      label: item.name,
      records: courseRecords,
    })
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedCourse(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{breakdownTitle}</CardTitle>
          <CardDescription>Tap a course to view enrolled personnel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {items.map((item) => {
            const isClickable = item.count > 0

            return (
              <button
                key={item.name}
                type="button"
                disabled={!isClickable}
                onClick={() => handleCourseClick(item)}
                className={cn(
                  "w-full space-y-2 rounded-lg text-left transition-colors",
                  isClickable &&
                    "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !isClickable && "cursor-default opacity-60",
                )}
              >
                <div className="flex items-center justify-between gap-2 px-1 text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {item.count.toLocaleString()} · {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </button>
            )
          })}
        </CardContent>
      </Card>

      <SchoolingDetailSheet
        groupLabel={selectedCourse ? `${selectedCourse.label} — Enrolled Personnel` : null}
        records={selectedCourse?.records ?? []}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
