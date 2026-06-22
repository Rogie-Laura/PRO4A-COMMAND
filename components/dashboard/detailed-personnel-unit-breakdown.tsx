"use client"

import { useMemo, useState } from "react"

import { DetailedPersonnelDetailSheet } from "@/components/dashboard/detailed-personnel-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { DetailedPersonnelRecord } from "@/lib/detailed-personnel-types"
import type { CountItem } from "@/lib/personnel-types"
import { cn } from "@/lib/utils"

type DetailedPersonnelUnitBreakdownProps = {
  items: CountItem[]
  records: DetailedPersonnelRecord[]
  breakdownTitle?: string
}

type SelectedGroup = {
  label: string
  records: DetailedPersonnelRecord[]
}

export function DetailedPersonnelUnitBreakdown({
  items,
  records,
  breakdownTitle = "Detailed by Unit From",
}: DetailedPersonnelUnitBreakdownProps) {
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null)
  const [open, setOpen] = useState(false)

  const recordsByUnitFrom = useMemo(() => {
    const map = new Map<string, DetailedPersonnelRecord[]>()

    for (const record of records) {
      const list = map.get(record.unitFrom) ?? []
      list.push(record)
      map.set(record.unitFrom, list)
    }

    return map
  }, [records])

  function handleGroupClick(item: CountItem) {
    if (item.count === 0) return

    const groupRecords = recordsByUnitFrom.get(item.name) ?? []
    if (groupRecords.length === 0) return

    setSelectedGroup({
      label: item.name,
      records: groupRecords,
    })
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedGroup(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{breakdownTitle}</CardTitle>
          <CardDescription>Tap a unit to view personnel details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {items.map((item) => {
            const isClickable = item.count > 0

            return (
              <button
                key={item.name}
                type="button"
                disabled={!isClickable}
                onClick={() => handleGroupClick(item)}
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

      <DetailedPersonnelDetailSheet
        groupLabel={selectedGroup?.label ?? null}
        records={selectedGroup?.records ?? []}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
