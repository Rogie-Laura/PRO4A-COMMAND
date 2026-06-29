import { getFirearmsUnitPresentation, FIREARMS_UNIT_ORDER } from "@/lib/firearms-config"
import type {
  FirearmsAnalytics,
  FirearmsCategorySummary,
  FirearmsSourceBreakdown,
  FirearmsUnitBreakdownItem,
} from "@/lib/firearms-types"
import type { ParsedFirearmsWorkbook } from "@/lib/firearms-xlsx-parser"

export function aggregateFirearmsSourceBreakdown(
  units: FirearmsUnitBreakdownItem[],
): FirearmsSourceBreakdown {
  return units.reduce(
    (totals, unit) => ({
      organic: totals.organic + unit.source.organic,
      donated: totals.donated + unit.source.donated,
      loaned: totals.loaned + unit.source.loaned,
    }),
    { organic: 0, donated: 0, loaned: 0 },
  )
}

function emptyCategory(id: "short" | "long", label: string): FirearmsCategorySummary {
  return {
    id,
    label,
    grandTotal: 0,
    units: FIREARMS_UNIT_ORDER.map((unitId) => {
      const presentation = getFirearmsUnitPresentation(unitId)
      return {
        unitId,
        label: presentation.label,
        shortLabel: presentation.shortLabel,
        logo: presentation.logo,
        colorClass: presentation.colorClass,
        strength: null,
        status: { svc: 0, unsvc: 0, ber: 0 },
        total: 0,
        source: { organic: 0, donated: 0, loaned: 0 },
        sourceTotal: 0,
        fillRate: null,
        isWarehouse: unitId === "ON-STOCK",
      }
    }),
  }
}

export function emptyFirearmsAnalytics(): FirearmsAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    shortFirearms: emptyCategory("short", "Short Firearms"),
    longFirearms: emptyCategory("long", "Long Firearms"),
  }
}

export function buildFirearmsAnalyticsFromWorkbook(
  workbook: ParsedFirearmsWorkbook,
  lastUpdated = new Date().toISOString(),
): FirearmsAnalytics {
  return {
    lastUpdated,
    dataReady: true,
    shortFirearms: workbook.shortFirearms,
    longFirearms: workbook.longFirearms,
  }
}

export const FIREARMS_ANALYTICS_CACHE_TAG = "firearms-analytics-v1"
