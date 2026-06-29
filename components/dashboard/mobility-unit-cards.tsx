"use client"

import { useState } from "react"

import { MobilityUnitStatusDialog } from "@/components/dashboard/mobility-unit-status-dialog"
import { OfficeLogo } from "@/components/dashboard/office-logo"
import type { VehicleUnitBreakdownItem } from "@/lib/mobility-types"

type MobilityUnitCardsProps = {
  units: VehicleUnitBreakdownItem[]
}

export function MobilityUnitCards({ units }: MobilityUnitCardsProps) {
  const [selectedUnit, setSelectedUnit] = useState<VehicleUnitBreakdownItem | null>(null)
  const [open, setOpen] = useState(false)

  function handleUnitClick(unit: VehicleUnitBreakdownItem) {
    setSelectedUnit(unit)
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedUnit(null)
    }
  }

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {units.map((unit) => (
          <button
            key={unit.unitId}
            type="button"
            onClick={() => handleUnitClick(unit)}
            className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <OfficeLogo
                src={unit.logo}
                alt={unit.label}
                fallback={unit.shortLabel}
                colorClass={unit.colorClass}
              />
              <span className="truncate text-sm font-medium">{unit.label}</span>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
              {unit.total.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <MobilityUnitStatusDialog unit={selectedUnit} open={open} onOpenChange={handleOpenChange} />
    </>
  )
}
