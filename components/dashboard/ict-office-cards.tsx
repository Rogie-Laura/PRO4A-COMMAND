import { OfficeLogo } from "@/components/dashboard/office-logo"
import type { IctOfficeBreakdownItem } from "@/lib/ict-equipment-types"
import { cn } from "@/lib/utils"

type IctOfficeCardsProps = {
  offices: IctOfficeBreakdownItem[]
  countClassName?: string
  compact?: boolean
}

export function IctOfficeCards({ offices, countClassName, compact = false }: IctOfficeCardsProps) {
  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {offices.map((office) => (
          <div
            key={office.subUnit}
            className="flex items-center gap-2.5 rounded-lg border bg-muted/30 px-2.5 py-2"
          >
            <OfficeLogo
              src={office.logo}
              alt={office.label}
              fallback={office.shortLabel}
              colorClass={office.colorClass}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{office.label}</p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                2025: {office.breakdown.year2025Below.toLocaleString()} · Jan 2026:{" "}
                {office.breakdown.asOfJanuary2026.toLocaleString()}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-base font-bold tabular-nums",
                countClassName ?? "text-primary",
              )}
            >
              {office.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {offices.map((office) => (
        <div
          key={office.subUnit}
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
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
              <p className="text-xs text-muted-foreground tabular-nums">
                2025: {office.breakdown.year2025Below.toLocaleString()} · Jan 2026:{" "}
                {office.breakdown.asOfJanuary2026.toLocaleString()}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 text-sm font-bold tabular-nums",
              countClassName ?? "text-primary",
            )}
          >
            {office.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
