export const PATROL_INTERVENTION_TYPES = [
  {
    id: "mobile_patrol",
    label: "Mobile Patrolling",
    image: "/markers/patrol-car.png",
  },
  {
    id: "motorcycle_patrol",
    label: "MC Patrolling",
    image: "/markers/Motocycle.png",
  },
  {
    id: "beat_patrol",
    label: "Beat Patrolling",
    image: "/markers/beat.png",
  },
  {
    id: "bike_patrol",
    label: "Bike Patrolling",
    image: "/markers/Bike.png",
  },
] as const

export type PatrolUnitTypeId = (typeof PATROL_INTERVENTION_TYPES)[number]["id"]

export type PatrolUnitCounts = Record<PatrolUnitTypeId, number>

export const EMPTY_PATROL_COUNTS: PatrolUnitCounts = {
  mobile_patrol: 0,
  motorcycle_patrol: 0,
  beat_patrol: 0,
  bike_patrol: 0,
}

export function getPatrollersMonitorUrl() {
  const configured = process.env.NEXT_PUBLIC_PATROLLERS_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")
  return "https://project-patrollers.vercel.app"
}
