export const VEHICLE_OWNERSHIP_CATEGORIES = [
  { id: "organic", label: "Total Organic" },
  { id: "lgu", label: "Loaned by LGU" },
  { id: "donated", label: "Donated" },
] as const

export const VEHICLE_CONDITION_CATEGORIES = [
  { id: "serviceable", label: "Serviceable" },
  { id: "unserviceable", label: "Unserviceable" },
  { id: "ber", label: "BER" },
] as const

export type VehicleOwnershipId = (typeof VEHICLE_OWNERSHIP_CATEGORIES)[number]["id"]
export type VehicleConditionId = (typeof VEHICLE_CONDITION_CATEGORIES)[number]["id"]

export function classifyVehicleOwnership(value: string): VehicleOwnershipId | null {
  const normalized = value.trim().toUpperCase()
  if (!normalized) return null

  if (/DONAT/.test(normalized)) return "donated"
  if (/LGU|LOAN/.test(normalized)) return "lgu"
  if (/ORGANIC/.test(normalized)) return "organic"

  return null
}

export function classifyVehicleCondition(value: string): VehicleConditionId | null {
  const normalized = value.trim().toUpperCase()
  if (!normalized) return null

  if (/\bBER\b|BEYOND ECONOMIC/.test(normalized)) return "ber"
  if (/UNSERVICE|NON[- ]?OPER|FOR REPAIR|CONDEMN/.test(normalized)) return "unserviceable"
  if (/SERVICEABLE|OPERATIONAL|OPER|SERVICE|ACTIVE|GOOD|RUNNING|AVAILABLE/.test(normalized)) {
    return "serviceable"
  }

  return null
}
