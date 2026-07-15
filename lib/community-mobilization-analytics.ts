import type {
  CommunityMobilizationAnalytics,
  CommunityMobilizationBreakdownRow,
  CommunityMobilizationBarangayStatus,
  CommunityMobilizationProvince,
  ParsedCommunityMobilizationWorkbook,
} from "@/lib/community-mobilization-types"

export function emptyCommunityMobilizationAnalytics(
  fileName = "",
): CommunityMobilizationAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    asOfLabel: null,
    recap: [],
    provinces: [],
  }
}

export function buildCommunityMobilizationAnalyticsFromWorkbook(
  workbook: ParsedCommunityMobilizationWorkbook,
  meta: { fileName: string; lastUpdated: string },
): CommunityMobilizationAnalytics {
  if (workbook.recap.length === 0 || workbook.provinces.length === 0) {
    return emptyCommunityMobilizationAnalytics(meta.fileName)
  }

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: true,
    asOfLabel: workbook.asOfLabel,
    recap: workbook.recap,
    provinces: workbook.provinces,
  }
}

export function getCommunityMobilizationRegionalTotal(
  recap: CommunityMobilizationAnalytics["recap"],
) {
  return recap.find((row) => row.isTotal) ?? null
}

type StatusBreakdownScope = {
  province?: string
  municipality?: string
}

export function collectMobilizationBreakdown(
  provinces: CommunityMobilizationProvince[],
  status: CommunityMobilizationBarangayStatus,
  scope: StatusBreakdownScope = {},
): CommunityMobilizationBreakdownRow[] {
  const rows: CommunityMobilizationBreakdownRow[] = []

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

export function getMobilizationFilterTitle(
  status: CommunityMobilizationBarangayStatus,
  scope: StatusBreakdownScope,
) {
  const statusLabel =
    status === "mobilized" ? "Mobilized Barangays" : "Not Yet Mobilized Barangays"

  if (scope.municipality && scope.province) {
    return `${statusLabel} · ${scope.municipality}, ${scope.province}`
  }

  if (scope.province) {
    return `${statusLabel} · ${scope.province}`
  }

  return `${statusLabel} · PRO4A`
}
