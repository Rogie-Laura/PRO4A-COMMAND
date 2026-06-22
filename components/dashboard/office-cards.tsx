"use client"

import { useState, useTransition } from "react"

import { fetchOfficeStations } from "@/app/(dashboard)/actions"
import { OfficeLogo } from "@/components/dashboard/office-logo"
import { OfficeStationSheet } from "@/components/dashboard/office-station-sheet"
import type { OfficeBreakdownCard } from "@/lib/personnel-client-payload"
import type { OfficeBreakdownItem } from "@/lib/personnel-types"

type OfficeCardsProps = {
  offices: OfficeBreakdownCard[]
}

export function OfficeCards({ offices }: OfficeCardsProps) {
  const [selectedOffice, setSelectedOffice] = useState<OfficeBreakdownItem | null>(null)
  const [open, setOpen] = useState(false)
  const [loadingSubUnit, setLoadingSubUnit] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOfficeClick(office: OfficeBreakdownCard) {
    if (isPending) return

    setLoadingSubUnit(office.subUnit)
    startTransition(async () => {
      try {
        const stations = await fetchOfficeStations(office.subUnit)
        setSelectedOffice({ ...office, stations })
        setOpen(true)
      } finally {
        setLoadingSubUnit(null)
      }
    })
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
            disabled={isPending && loadingSubUnit === office.subUnit}
            onClick={() => handleOfficeClick(office)}
            className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <OfficeLogo
                src={office.logo}
                alt={office.label}
                fallback={office.shortLabel}
                colorClass={office.colorClass}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{office.label}</p>
              </div>
            </div>
            <span className="shrink-0 text-lg font-bold tabular-nums">
              {loadingSubUnit === office.subUnit ? "…" : office.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <OfficeStationSheet office={selectedOffice} open={open} onOpenChange={handleOpenChange} />
    </>
  )
}
