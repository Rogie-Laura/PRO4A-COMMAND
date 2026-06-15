"use client"

import { useMemo, useState } from "react"

import { AdminHoldingDetailSheet } from "@/components/dashboard/admin-holding-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { AdminHoldingRecord } from "@/lib/admin-holding-types"
import type { CountItem } from "@/lib/personnel-types"
import { cn } from "@/lib/utils"

type AdminHoldingStatusBreakdownProps = {
  items: CountItem[]
  records: AdminHoldingRecord[]
}

type SelectedStatus = {
  label: string
  records: AdminHoldingRecord[]
}

export function AdminHoldingStatusBreakdown({
  items,
  records,
}: AdminHoldingStatusBreakdownProps) {
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus | null>(null)
  const [open, setOpen] = useState(false)

  const recordsByStatus = useMemo(() => {
    const map = new Map<string, AdminHoldingRecord[]>()

    for (const record of records) {
      const list = map.get(record.status) ?? []
      list.push(record)
      map.set(record.status, list)
    }

    return map
  }, [records])

  function handleStatusClick(item: CountItem) {
    if (item.count === 0) return

    const statusRecords = recordsByStatus.get(item.name) ?? []
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
          <CardTitle>Admin Holding by Status</CardTitle>
          <CardDescription>Tap a status to view personnel details</CardDescription>
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
                <Progress value={item.percentage} className="h-2" />
              </button>
            )
          })}
        </CardContent>
      </Card>

      <AdminHoldingDetailSheet
        statusLabel={selectedStatus?.label ?? null}
        records={selectedStatus?.records ?? []}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
