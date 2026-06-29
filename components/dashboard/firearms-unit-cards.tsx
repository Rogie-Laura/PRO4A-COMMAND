import { OfficeLogo } from "@/components/dashboard/office-logo"
import type { FirearmsUnitBreakdownItem } from "@/lib/firearms-types"

type FirearmsUnitCardsProps = {
  units: FirearmsUnitBreakdownItem[]
}

export function FirearmsUnitCards({ units }: FirearmsUnitCardsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {units.map((unit) => (
        <div
          key={unit.unitId}
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
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
        </div>
      ))}
    </div>
  )
}
