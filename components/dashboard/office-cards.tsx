"use client"

import { useState } from "react"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import { OfficeStationSheet } from "@/components/dashboard/office-station-sheet"
import type { OfficeBreakdownItem } from "@/lib/personnel-types"

type OfficeCardsProps = {
  offices: OfficeBreakdownItem[]
}

export function OfficeCards({ offices }: OfficeCardsProps) {
  const [selectedOffice, setSelectedOffice] = useState<OfficeBreakdownItem | null>(null)
  const [open, setOpen] = useState(false)

  function handleOfficeClick(office: OfficeBreakdownItem) {
    setSelectedOffice(office)
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedOffice(null)
    }
  }

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {offices.map((office) => (
          <button
            key={office.subUnit}
            type="button"
            onClick={() => handleOfficeClick(office)}
            className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <OfficeLogo
                src={office.logo}
                alt={office.label}
                fallback={office.shortLabel}
                colorClass={office.colorClass}
              />
              <span className="truncate text-sm font-medium">{office.label}</span>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
              {office.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <OfficeStationSheet
        office={selectedOffice}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
