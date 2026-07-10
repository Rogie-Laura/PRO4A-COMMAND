import { establishmentTypeKey } from "@/lib/establishment-xlsx-parser"
import type {
  EstablishmentAnalytics,
  EstablishmentTypeSummary,
  ParsedEstablishmentRecord,
} from "@/lib/establishment-types"

export function emptyEstablishmentAnalytics(fileName = ""): EstablishmentAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    totalCount: 0,
    types: [],
  }
}

export function buildEstablishmentAnalyticsFromRecords(
  records: ParsedEstablishmentRecord[],
  meta: { fileName: string; lastUpdated: string },
): EstablishmentAnalytics {
  const typeMap = new Map<
    string,
    {
      establishmentType: string
      total: number
      ppoCounts: Map<string, number>
    }
  >()

  for (const record of records) {
    const typeKey = establishmentTypeKey(record.establishmentType)
    const existing = typeMap.get(typeKey) ?? {
      establishmentType: record.establishmentType,
      total: 0,
      ppoCounts: new Map<string, number>(),
    }

    existing.total += 1
    existing.ppoCounts.set(record.ppo, (existing.ppoCounts.get(record.ppo) ?? 0) + 1)
    typeMap.set(typeKey, existing)
  }

  const types: EstablishmentTypeSummary[] = [...typeMap.entries()]
    .map(([typeKey, value]) => ({
      typeKey,
      establishmentType: value.establishmentType,
      total: value.total,
      ppoBreakdown: [...value.ppoCounts.entries()]
        .map(([ppo, count]) => ({ ppo, count }))
        .sort((a, b) => b.count - a.count || a.ppo.localeCompare(b.ppo)),
    }))
    .sort((a, b) => b.total - a.total || a.establishmentType.localeCompare(b.establishmentType))

  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: records.length > 0,
    totalCount: records.length,
    types,
  }
}
