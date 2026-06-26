import { OFFICES, type OfficeConfig } from "@/lib/office-config"

const PATROLLERS_OFFICE_ALIASES: Record<string, string> = {
  PRO4A: "REGIONAL HEADQUARTERS",
  RHQ: "REGIONAL HEADQUARTERS",
  "REGIONAL HEADQUARTERS": "REGIONAL HEADQUARTERS",
  "CAVITE PPO": "CAVITE POLICE PROVINCIAL OFFICE",
  "Cavite PPO": "CAVITE POLICE PROVINCIAL OFFICE",
  "LAGUNA PPO": "LAGUNA POLICE PROVINCIAL OFFICE",
  "Laguna PPO": "LAGUNA POLICE PROVINCIAL OFFICE",
  "BATANGAS PPO": "BATANGAS POLICE PROVINCIAL OFFICE",
  "Batangas PPO": "BATANGAS POLICE PROVINCIAL OFFICE",
  "RIZAL PPO": "RIZAL POLICE PROVINCIAL OFFICE",
  "Rizal PPO": "RIZAL POLICE PROVINCIAL OFFICE",
  "QUEZON PPO": "QUEZON POLICE PROVINCIAL OFFICE",
  "Quezon PPO": "QUEZON POLICE PROVINCIAL OFFICE",
  RMFB4A: "REGIONAL MOBILE FORCE BATTALION",
  RMFB: "REGIONAL MOBILE FORCE BATTALION",
  "REGIONAL MOBILE FORCE BATTALION": "REGIONAL MOBILE FORCE BATTALION",
}

const OFFICE_BY_SUBUNIT = new Map(OFFICES.map((office) => [office.subUnit, office]))
const OFFICE_BY_LABEL = new Map(
  OFFICES.map((office) => [office.label.toLowerCase(), office]),
)

export type PatrolOfficeDisplay = {
  key: string
  label: string
  logo: string
  shortLabel: string
  colorClass: string
  sortIndex: number
}

export function resolvePatrolOfficeDisplay(officeName: string): PatrolOfficeDisplay {
  const trimmed = officeName.trim() || "Unassigned"
  const subUnit =
    PATROLLERS_OFFICE_ALIASES[trimmed] ??
    PATROLLERS_OFFICE_ALIASES[trimmed.toUpperCase()] ??
    trimmed

  const matched =
    OFFICE_BY_SUBUNIT.get(subUnit) ??
    OFFICE_BY_LABEL.get(trimmed.toLowerCase()) ??
    OFFICE_BY_LABEL.get(subUnit.toLowerCase())

  if (matched) {
    return {
      key: trimmed,
      label: matched.label,
      logo: matched.logo,
      shortLabel: matched.shortLabel,
      colorClass: matched.colorClass,
      sortIndex: OFFICES.indexOf(matched),
    }
  }

  return {
    key: trimmed,
    label: trimmed,
    logo: "/logos/PRO4A.png",
    shortLabel: trimmed.slice(0, 2).toUpperCase() || "—",
    colorClass: "bg-primary",
    sortIndex: OFFICES.length + 1,
  }
}

export function sortPatrolOfficeRows<T extends { office: string }>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const aDisplay = resolvePatrolOfficeDisplay(a.office)
    const bDisplay = resolvePatrolOfficeDisplay(b.office)
    if (aDisplay.sortIndex !== bDisplay.sortIndex) {
      return aDisplay.sortIndex - bDisplay.sortIndex
    }
    return aDisplay.label.localeCompare(bDisplay.label)
  })
}

export function getKnownOfficeConfigs(): OfficeConfig[] {
  return OFFICES
}
