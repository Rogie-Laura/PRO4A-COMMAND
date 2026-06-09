const STATION_LABELS: Record<string, string> = {
  // Cavite PPO
  "BACOOR CITY PS": "BACOOR CCPS",
  "CARMONA CITY PS": "CARMONA CCPS",
  "CAVITE CITY PS": "CAVITE CCPS",
  "DASMARIÑAS MPS": "DASMARIÑAS CCPS",
  "GEN TRIAS MPS": "GEN TRIAS CCPS",
  "IMUS MPS": "IMUS CCPS",
  "TAGAYTAY CITY PS": "TAGAYTAY CCPS",
  "TRECE MARTIRES MPS": "TRECE MARTIREZ CCPS",

  // Laguna PPO
  "BIÑAN CITY PS": "BIÑAN CCPS",
  "CABUYAO CPS": "CABUYAO CCPS",
  "CALAMBA CITY PS": "CALAMBA CCPS",
  "SAN PABLO CITY PS": "SAN PABLO CCPS",
  "SAN PEDRO CPS": "SAN PEDRO CCPS",
  "STA ROSA CITY PS": "STA ROSA CCPS",

  // Batangas PPO
  "BATANGAS CITY PS": "BATANGAS CCPS",
  "CALACA MPS": "CALACA CCPS",
  "LIPA CITY PS": "LIPA CCPS",
  "STO TOMAS CITY PS": "STO TOMAS CCPS",
  "TANAUAN CITY PS": "TANAUAN CCPS",

  // Quezon PPO
  "LUCENA CITY PS": "Lucena CCPS",
  "TAYABAS CITY PS": "Tayabas CCPS",

  // Rizal PPO
  "ANTIPOLO CITY PS": "Antipolo CCPS",
}

function normalizeStationKey(station: string) {
  return station.trim().replace(/\s+/g, " ").toUpperCase()
}

export function formatStationLabel(station: string): string {
  const trimmed = station.trim()
  if (!trimmed) return "Unassigned"

  return STATION_LABELS[normalizeStationKey(trimmed)] ?? trimmed
}
