import { OFFICES } from "@/lib/office-config"

export const FIREARMS_SHEET_NAMES = {
  short: "SHORT FIREARMS",
  long: "LONG FIREARMS",
} as const

export const FIREARMS_UNIT_ORDER = [
  "RHQ",
  "CAVITE",
  "LAGUNA",
  "BATANGAS",
  "RIZAL",
  "QUEZON",
  "RMFB",
  "ON-STOCK",
] as const

export type FirearmsUnitId = (typeof FIREARMS_UNIT_ORDER)[number]

const officeByShort = new Map(
  OFFICES.map((office) => [office.shortLabel.toUpperCase(), office] as const),
)

const officeByLabel = new Map(
  OFFICES.map((office) => [office.label.toUpperCase(), office] as const),
)

export function normalizeFirearmsUnitKey(value: string): FirearmsUnitId | null {
  const normalized = value.trim().toUpperCase()

  if (normalized === "RHQ" || normalized.includes("REGIONAL HEADQUARTERS")) return "RHQ"
  if (normalized === "CAVITE" || normalized.includes("CAVITE")) return "CAVITE"
  if (normalized === "LAGUNA" || normalized.includes("LAGUNA")) return "LAGUNA"
  if (normalized === "BATANGAS" || normalized.includes("BATANGAS")) return "BATANGAS"
  if (normalized === "RIZAL" || normalized.includes("RIZAL")) return "RIZAL"
  if (normalized === "QUEZON" || normalized.includes("QUEZON")) return "QUEZON"
  if (normalized === "RMFB" || normalized.includes("MOBILE FORCE")) return "RMFB"
  if (normalized.includes("ON-STOCK") || normalized.includes("WAREHOUSE")) return "ON-STOCK"

  return null
}

export function getFirearmsUnitPresentation(unitId: FirearmsUnitId) {
  if (unitId === "ON-STOCK") {
    return {
      label: "ON-STOCK (Warehouse)",
      shortLabel: "WH",
      logo: "/logos/PRO4A.png",
      colorClass: "bg-slate-500",
    }
  }

  if (unitId === "RHQ") {
    const office = OFFICES.find((item) => item.subUnit === "REGIONAL HEADQUARTERS")
    return {
      label: "RHQ",
      shortLabel: office?.shortLabel ?? "RHQ",
      logo: office?.logo ?? "/logos/PRO4A.png",
      colorClass: office?.colorClass ?? "bg-blue-500",
    }
  }

  const office =
    officeByShort.get(unitId) ??
    officeByLabel.get(`${unitId} PPO`) ??
    OFFICES.find((item) => item.label.toUpperCase().startsWith(unitId))

  return {
    label: unitId,
    shortLabel: office?.shortLabel ?? unitId.slice(0, 2),
    logo: office?.logo ?? "/logos/PRO4A.png",
    colorClass: office?.colorClass ?? "bg-primary",
  }
}
