import { OfficeLogo } from "@/components/dashboard/office-logo"
import { buildCrimePpoBreakdownItems } from "@/lib/crime-ppo-config"
import type { CountItem } from "@/lib/personnel-types"

type CrimePpoDistributionProps = {
  items: CountItem[]
  total: number
}

export function CrimePpoDistribution({ items, total }: CrimePpoDistributionProps) {
  const offices = buildCrimePpoBreakdownItems(items, total)

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {offices.map((office) => (
        <div
          key={office.csvName}
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
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
        </div>
      ))}
    </div>
  )
}
