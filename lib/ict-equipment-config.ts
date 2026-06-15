import { OFFICES } from "@/lib/office-config"

/** RECAP simplified block — row 19 Serviceable (B, C, D). */
export const ICT_OFFICE_UNITS = [
  "RHQ",
  "CAVITE PPO",
  "LAGUNA PPO",
  "BATANGAS PPO",
  "RIZAL PPO",
  "QUEZON PPO",
  "RMFB",
] as const

const SHEET_UNIT_TO_SUBUNIT: Record<(typeof ICT_OFFICE_UNITS)[number], string> = {
  RHQ: "REGIONAL HEADQUARTERS",
  "CAVITE PPO": "CAVITE POLICE PROVINCIAL OFFICE",
  "LAGUNA PPO": "LAGUNA POLICE PROVINCIAL OFFICE",
  "BATANGAS PPO": "BATANGAS POLICE PROVINCIAL OFFICE",
  "RIZAL PPO": "RIZAL POLICE PROVINCIAL OFFICE",
  "QUEZON PPO": "QUEZON POLICE PROVINCIAL OFFICE",
  RMFB: "REGIONAL MOBILE FORCE BATTALION",
}

const OFFICE_BY_SUBUNIT = new Map(OFFICES.map((office) => [office.subUnit, office]))

export function resolveIctOffice(unit: string) {
  const subUnit = SHEET_UNIT_TO_SUBUNIT[unit as (typeof ICT_OFFICE_UNITS)[number]]
  return subUnit ? OFFICE_BY_SUBUNIT.get(subUnit) : undefined
}
