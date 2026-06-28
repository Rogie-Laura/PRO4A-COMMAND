"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"

import { comparePpoCrimeTypesAction } from "@/app/(dashboard)/ridmd/actions"
import { ComparativeFocusCrimeChart } from "@/components/dashboard/crime-comparative-focus-chart"
import type { ComparativeBarRow } from "@/components/dashboard/crime-comparative-chart-utils"
import { OfficeLogo } from "@/components/dashboard/office-logo"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CrimePeriodRange } from "@/lib/crime-comparative"
import type { CrimePpoBreakdownItem } from "@/lib/crime-ppo-config"

type CrimeComparativePpoSheetProps = {
  office: CrimePpoBreakdownItem | null
  periodA: CrimePeriodRange
  periodB: CrimePeriodRange
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(media.matches)

    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return isMobile
}

export function CrimeComparativePpoSheet({
  office,
  periodA,
  periodB,
  open,
  onOpenChange,
}: CrimeComparativePpoSheetProps) {
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<ComparativeBarRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const profileCacheRef = useRef(new Map<string, ComparativeBarRow[]>())

  useEffect(() => {
    if (!open || !office) {
      setRows([])
      setError(null)
      return
    }

    const cacheKey = `${office.csvName}|${periodA.start}|${periodA.end}|${periodB.start}|${periodB.end}`
    const cachedRows = profileCacheRef.current.get(cacheKey)
    if (cachedRows) {
      setRows(cachedRows)
      setError(null)
      return
    }

    startTransition(async () => {
      try {
        const result = await comparePpoCrimeTypesAction(office.csvName, periodA, periodB)
        const nextRows = result.map((row) => ({
          label: row.crime,
          periodA: row.periodA,
          periodB: row.periodB,
          change: row.change,
          changePct: row.changePct,
          changeDirection: row.changeDirection,
        }))
        profileCacheRef.current.set(cacheKey, nextRows)
        setRows(nextRows)
        setError(null)
      } catch (loadError) {
        setRows([])
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Hindi ma-load ang focus crime profile para sa office na ito.",
        )
      }
    })
  }, [open, office, periodA, periodB])

  const chartHeight = useMemo(() => (isMobile ? 400 : 460), [isMobile])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        {office ? (
          <>
            <DialogHeader className="border-b border-primary/15 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <OfficeLogo
                  src={office.logo}
                  alt={office.label}
                  fallback={office.shortLabel}
                  colorClass={office.colorClass}
                />
                <div className="min-w-0">
                  <DialogTitle>{office.label} Crime Profile</DialogTitle>
                  <DialogDescription>
                    Focus crimes · {periodA.label} vs {periodB.label}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody>
              {isPending ? (
                <Skeleton className="h-[400px] w-full rounded-lg" />
              ) : error ? (
                <p className="py-8 text-center text-sm text-destructive">{error}</p>
              ) : (
                <ComparativeFocusCrimeChart rows={rows} isMobile={isMobile} height={chartHeight} />
              )}
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
