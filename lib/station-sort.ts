import type { StationBreakdownItem } from "@/lib/personnel-types"

type StationSortTier = 0 | 1 | 2 | 3

function getStationSortTier(station: string): StationSortTier {
  const name = station.trim().toUpperCase()

  if (
    /^HQS\b/.test(name) ||
    name === "ORD" ||
    name === "FORCE HEADQUARTERS"
  ) {
    return 0
  }

  if (name.includes("PMFB")) {
    return 2
  }

  if (name.includes("TOURISM") || name.includes("TOURIST")) {
    return 3
  }

  return 1
}

export function sortStationBreakdown(
  stations: StationBreakdownItem[],
): StationBreakdownItem[] {
  return [...stations].sort((a, b) => {
    const tierA = getStationSortTier(a.station)
    const tierB = getStationSortTier(b.station)

    if (tierA !== tierB) {
      return tierA - tierB
    }

    return a.station.localeCompare(b.station, "en", { sensitivity: "base" })
  })
}
