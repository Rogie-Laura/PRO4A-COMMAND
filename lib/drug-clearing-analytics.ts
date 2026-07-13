import type {
  DrugClearingAnalytics,
  DrugClearingBreakdownRow,
  DrugClearingProvince,
  DrugClearingStatusFilter,
  ParsedDrugClearingWorkbook,
} from "@/lib/drug-clearing-types"

export function emptyDrugClearingAnalytics(fileName = ""): DrugClearingAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    recap: [],
    provinces: [],
  }
}

export function buildDrugClearingAnalyticsFromWorkbook(
  workbook: ParsedDrugClearingWorkbook,
  meta: { fileName: string; lastUpdated: string },
): DrugClearingAnalytics {
  if (workbook.recap.length === 0 || workbook.provinces.length === 0) {
    return emptyDrugClearingAnalytics(meta.fileName)
  }

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: true,
    recap: workbook.recap,
    provinces: workbook.provinces,
  }
}

export function getDrugClearingRegionalTotal(recap: DrugClearingAnalytics["recap"]) {
  return recap.find((row) => row.isTotal) ?? null
}

type StatusBreakdownScope = {
  province?: string
  municipality?: string
}

export function collectStatusBreakdown(
  provinces: DrugClearingProvince[],
  status: DrugClearingStatusFilter,
  scope: StatusBreakdownScope = {},
): DrugClearingBreakdownRow[] {
  const rows: DrugClearingBreakdownRow[] = []

  for (const province of provinces) {
    if (scope.province && province.name !== scope.province) continue

    for (const municipality of province.municipalities) {
      if (scope.municipality && municipality.name !== scope.municipality) continue

      for (const barangay of municipality.barangays) {
        if (barangay.status !== status) continue

        rows.push({
          ppo: province.name,
          municipality: municipality.name,
          barangay: barangay.name,
        })
      }
    }
  }

  return rows.sort((a, b) => {
    const ppoCompare = a.ppo.localeCompare(b.ppo)
    if (ppoCompare !== 0) return ppoCompare

    const municipalityCompare = a.municipality.localeCompare(b.municipality)
    if (municipalityCompare !== 0) return municipalityCompare

    return a.barangay.localeCompare(b.barangay)
  })
}

export function getStatusFilterTitle(
  status: DrugClearingStatusFilter,
  scope: StatusBreakdownScope,
) {
  const statusLabel =
    status === "cleared"
      ? "Drug Cleared"
      : status === "affected"
        ? "Drug Affected"
        : status === "unaffected"
          ? "Unaffected"
          : "Drug Free"

  if (scope.municipality && scope.province) {
    return `${statusLabel} · ${scope.municipality}, ${scope.province}`
  }

  if (scope.province) {
    return `${statusLabel} · ${scope.province}`
  }

  return `${statusLabel} · PRO4A`
}
