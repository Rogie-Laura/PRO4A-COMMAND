"use client"

import { useState } from "react"
import { ArrowRightLeft, type LucideIcon } from "lucide-react"

import { DetailedPersonnelTabDetailSheet } from "@/components/dashboard/detailed-personnel-tab-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DetailedPersonnelAnalytics } from "@/lib/detailed-personnel-types"
import { cn } from "@/lib/utils"

type DetailedPersonnelSectionProps = {
  data: DetailedPersonnelAnalytics
  icon?: LucideIcon
  accentClassName?: string
}

export function DetailedPersonnelSection({
  data,
  icon: Icon = ArrowRightLeft,
  accentClassName = "h-full gap-0 overflow-hidden border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card text-sky-700 dark:text-sky-300 [&_[data-slot=card-description]]:text-sky-700/90 dark:[&_[data-slot=card-description]]:text-sky-300/90",
}: DetailedPersonnelSectionProps) {
  const [open, setOpen] = useState(false)
  const isClickable = data.dataReady && data.records.length > 0

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
            <p className="text-sm font-medium text-foreground">Total Personnel on Detail</p>
            {!data.dataReady ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Walang data pa sa tab na ito.
              </p>
            ) : isClickable ? (
              <p className="mt-2 text-xs font-medium text-foreground/80">
                Tap to view personnel list
              </p>
            ) : null}
          </CardContent>
        </Card>
      </button>

      <DetailedPersonnelTabDetailSheet
        title={data.title}
        records={data.records}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
