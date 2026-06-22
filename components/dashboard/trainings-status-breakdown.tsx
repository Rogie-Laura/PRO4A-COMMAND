"use client"

import { useMemo, useState } from "react"

import { TrainingsDetailSheet } from "@/components/dashboard/trainings-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TRAINING_STATUS_LABELS } from "@/lib/trainings-config"
import type { CountItem } from "@/lib/personnel-types"
import type { TrainingRecord } from "@/lib/trainings-types"
import { cn } from "@/lib/utils"

type TrainingsStatusBreakdownProps = {
  items: CountItem[]
  records: TrainingRecord[]
}

type SelectedStatus = {
  label: string
  records: TrainingRecord[]
}

const STATUS_PROGRESS_CLASS: Record<string, string> = {
  Completed: "[&>div]:bg-emerald-500",
  Ongoing: "[&>div]:bg-sky-500",
  "To Be Opened": "[&>div]:bg-amber-500",
  Cancelled: "[&>div]:bg-rose-500",
  Postponed: "[&>div]:bg-violet-500",
}

export function TrainingsStatusBreakdown({
  items,
  records,
}: TrainingsStatusBreakdownProps) {
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus | null>(null)
  const [open, setOpen] = useState(false)

  const recordsByStatusLabel = useMemo(() => {
    const map = new Map<string, TrainingRecord[]>()

    for (const record of records) {
      const label = TRAINING_STATUS_LABELS[record.status]
      const list = map.get(label) ?? []
      list.push(record)
      map.set(label, list)
    }

    return map
  }, [records])

  function handleStatusClick(item: CountItem) {
    if (item.count === 0) return

    const statusRecords = recordsByStatusLabel.get(item.name) ?? []
    if (statusRecords.length === 0) return

    setSelectedStatus({
      label: item.name,
      records: statusRecords,
    })
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedStatus(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Training Status Breakdown</CardTitle>
          <CardDescription>Tap a status to view class and training details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {items.map((item) => {
            const isClickable = item.count > 0

            return (
              <button
                key={item.name}
                type="button"
                disabled={!isClickable}
                onClick={() => handleStatusClick(item)}
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
                <Progress
                  value={item.percentage}
                  className={cn("h-2", STATUS_PROGRESS_CLASS[item.name])}
                />
              </button>
            )
          })}
        </CardContent>
      </Card>

      <TrainingsDetailSheet
        statusLabel={selectedStatus?.label ?? null}
        records={selectedStatus?.records ?? []}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
