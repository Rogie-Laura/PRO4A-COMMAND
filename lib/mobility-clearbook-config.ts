import { OFFICES } from "@/lib/office-config"

export const MOBILITY_CLEARBOOK_SHEET_NAME = "CLEARBOOK" as const

export const MOBILITY_UNIT_ORDER = [
  "RHQ",
  "CAVITE",
  "LAGUNA",
  "BATANGAS",
  "RIZAL",
  "QUEZON",
  "RMFB",
] as const

export type MobilityUnitId = (typeof MOBILITY_UNIT_ORDER)[number]

const officeByShort = new Map(
  OFFICES.map((office) => [office.shortLabel.toUpperCase(), office] as const),
)

const officeByLabel = new Map(
  OFFICES.map((office) => [office.label.toUpperCase(), office] as const),
)

export function normalizeMobilityUnitKey(value: string): MobilityUnitId | null {
  const normalized = value.trim().toUpperCase()

  if (normalized === "RHQ" || normalized.includes("REGIONAL HEADQUARTERS")) return "RHQ"
  if (normalized === "CAVITE" || normalized.includes("CAVITE")) return "CAVITE"
  if (normalized === "LAGUNA" || normalized.includes("LAGUNA")) return "LAGUNA"
  if (normalized === "BATANGAS" || normalized.includes("BATANGAS")) return "BATANGAS"
  if (normalized === "RIZAL" || normalized.includes("RIZAL")) return "RIZAL"
  if (normalized === "QUEZON" || normalized.includes("QUEZON")) return "QUEZON"
  if (normalized === "RMFB" || normalized.includes("MOBILE FORCE")) return "RMFB"

  return null
}

export function getMobilityUnitPresentation(unitId: MobilityUnitId) {
  if (unitId === "RHQ") {
    const office = OFFICES.find((item) => item.subUnit === "REGIONAL HEADQUARTERS")
    return {
      label: "RHQ",
      shortLabel: office?.shortLabel ?? "RHQ",
      logo: office?.logo ?? "/logos/PRO4A.png",
      colorClass: office?.colorClass ?? "bg-blue-500",
      subUnit: office?.subUnit ?? "REGIONAL HEADQUARTERS",
    }
  }

  const office =
    officeByShort.get(unitId) ??
    officeByLabel.get(`${unitId} PPO`) ??
    OFFICES.find((item) => item.label.toUpperCase().startsWith(unitId))

  return {
    label: unitId.charAt(0) + unitId.slice(1).toLowerCase(),
    shortLabel: office?.shortLabel ?? unitId.slice(0, 2),
    logo: office?.logo ?? "/logos/PRO4A.png",
    colorClass: office?.colorClass ?? "bg-primary",
    subUnit: office?.subUnit ?? unitId,
  }
}
