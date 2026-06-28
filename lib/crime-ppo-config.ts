import { OFFICES } from "@/lib/office-config"
import type { CountItem } from "@/lib/personnel-types"

const CSV_PPO_TO_SUBUNIT: Record<string, string> = {
  "CAVITE PPO": "CAVITE POLICE PROVINCIAL OFFICE",
  "LAGUNA PPO": "LAGUNA POLICE PROVINCIAL OFFICE",
  "BATANGAS PPO": "BATANGAS POLICE PROVINCIAL OFFICE",
  "RIZAL PPO": "RIZAL POLICE PROVINCIAL OFFICE",
  "QUEZON PPO": "QUEZON POLICE PROVINCIAL OFFICE",
}

export const CRIME_PPO_ORDER = [
  "CAVITE PPO",
  "LAGUNA PPO",
  "BATANGAS PPO",
  "RIZAL PPO",
  "QUEZON PPO",
] as const

/** Compact labels for focus crime profile pie legend. */
export const CRIME_PPO_PIE_LABELS: Record<(typeof CRIME_PPO_ORDER)[number], string> = {
  "CAVITE PPO": "CPPO",
  "LAGUNA PPO": "LPPO",
  "BATANGAS PPO": "BPPO",
  "RIZAL PPO": "RPPO",
  "QUEZON PPO": "QPPO",
}

export type CrimePpoBreakdownItem = {
  csvName: string
  label: string
  shortLabel: string
  logo: string
  colorClass: string
  count: number
  percentage: number
}

const officeBySubUnit = new Map(OFFICES.map((office) => [office.subUnit, office]))

function resolveOffice(csvName: string) {
  const subUnit = CSV_PPO_TO_SUBUNIT[csvName.toUpperCase()]
  return subUnit ? officeBySubUnit.get(subUnit) : undefined
}

export function buildCrimePpoBreakdownItems(
  breakdown: CountItem[],
  total: number,
): CrimePpoBreakdownItem[] {
  const counts = new Map(
    breakdown.map((item) => [item.name.trim().toUpperCase(), item.count] as const),
  )

  const ordered = CRIME_PPO_ORDER.map((csvName) => {
    const office = resolveOffice(csvName)
    const count = counts.get(csvName) ?? 0

    return {
      csvName,
      label: office?.label ?? csvName,
      shortLabel: office?.shortLabel ?? csvName.slice(0, 2),
      logo: office?.logo ?? "/logos/PRO4A.png",
      colorClass: office?.colorClass ?? "bg-primary",
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }
  })

  const known = new Set<string>(CRIME_PPO_ORDER)
  const extras = breakdown
    .filter((item) => !known.has(item.name.trim().toUpperCase() as (typeof CRIME_PPO_ORDER)[number]))
    .map((item) => {
      const csvName = item.name.trim()
      const office = resolveOffice(csvName)

      return {
        csvName,
        label: office?.label ?? csvName,
        shortLabel: office?.shortLabel ?? csvName.slice(0, 2),
        logo: office?.logo ?? "/logos/PRO4A.png",
        colorClass: office?.colorClass ?? "bg-primary",
        count: item.count,
        percentage: item.percentage,
      }
    })

  return [...ordered, ...extras]
}
