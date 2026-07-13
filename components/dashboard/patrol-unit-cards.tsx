"use client"

import { useState } from "react"
import Image from "next/image"

import { PatrolUnitOfficeModal } from "@/components/dashboard/patrol-unit-office-modal"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PATROL_INTERVENTION_TYPES,
  type PatrolUnitCounts,
  type PatrolUnitTypeId,
} from "@/lib/patrol-intervention-config"
import type { PatrolOfficeBreakdownRow } from "@/lib/patrollers-counts"
import { cn } from "@/lib/utils"

type PatrolUnitCardsProps = {
  dataOk: boolean
  counts: PatrolUnitCounts
  dutyCounts: PatrolUnitCounts
  officeBreakdown: PatrolOfficeBreakdownRow[]
}

export function PatrolUnitCards({
  dataOk,
  counts,
  dutyCounts,
  officeBreakdown,
}: PatrolUnitCardsProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<PatrolUnitTypeId | null>(null)
  const [open, setOpen] = useState(false)

  const selectedType = PATROL_INTERVENTION_TYPES.find((type) => type.id === selectedTypeId)

  function handleCardClick(typeId: PatrolUnitTypeId) {
    if (!dataOk) return
    setSelectedTypeId(typeId)
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedTypeId(null)
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PATROL_INTERVENTION_TYPES.map((type) => {
          const patrolling = dataOk ? (counts[type.id] ?? 0) : null
          const onDuty = dataOk ? (dutyCounts[type.id] ?? 0) : null
          const isClickable = dataOk

          const card = (
            <Card
              className={cn(
                "gap-0 overflow-hidden",
                isClickable &&
                  "cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted/60">
                    <Image
                      src={type.image}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <CardDescription>{type.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">
                      {patrolling ?? "—"}
                    </CardTitle>
                    {dataOk && (
                      <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                        <span className="font-semibold text-foreground">{onDuty}</span> personnel
                        on duty
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Active units on map · personnel marked on duty in the mobile app.
                  {isClickable ? " · Tap for office breakdown" : ""}
                </p>
              </CardContent>
            </Card>
          )

          if (!isClickable) {
            return <div key={type.id}>{card}</div>
          }

          return (
            <button
              key={type.id}
              type="button"
              className="text-left"
              onClick={() => handleCardClick(type.id)}
            >
              {card}
            </button>
          )
        })}
      </div>

      <PatrolUnitOfficeModal
        patrolTypeId={selectedTypeId}
        patrolTypeLabel={selectedType?.label ?? null}
        patrolTypeImage={selectedType?.image ?? null}
        officeBreakdown={officeBreakdown}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
