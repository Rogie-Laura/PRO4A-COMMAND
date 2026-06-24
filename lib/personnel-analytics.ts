import { unstable_cache } from "next/cache"

import {
  buildPersonnelAnalyticsFromRecords,
  mapPersonnelRow,
} from "@/lib/personnel-aggregations"
import { fetchPersonnelRecapCsv, fetchPersonnelSheetCsv, parseCsv } from "@/lib/google-sheets"
import { parsePersonnelRecap } from "@/lib/personnel-recap-parser"
import type { PersonnelAnalytics } from "@/lib/personnel-types"

function emptyAnalytics(): PersonnelAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    kpis: [
      {
        id: "total",
        label: "Total Personnel",
        value: "0",
        detail: "PRO CALABARZON roster",
      },
    ],
    workforce: {
      uniformed: { total: 0, pco: 0, pnco: 0 },
      nup: 0,
      gender: [],
    },
    officeBreakdown: [],
    rankDistribution: { pco: [], pnco: [] },
    ageDistributionByOffice: [],
    rankTenureDistribution: [],
    genderStats: [],
    statusStats: [],
    unitRows: [],
    leadership: {
      regionalCommandGroup: [],
      rStaff: [],
      provincialDirectors: [],
    },
  }
}

async function loadPersonnelAnalyticsFromRoster(): Promise<PersonnelAnalytics> {
  const csv = await fetchPersonnelSheetCsv()
  const rows = parseCsv(csv)
  const records = rows.map(mapPersonnelRow).filter((r) => r.lastName || r.firstName)
  const analytics = buildPersonnelAnalyticsFromRecords(records, { includeRankTenureDetails: false })

  return {
    lastUpdated: new Date().toISOString(),
    ...analytics,
  }
}

async function loadPersonnelAnalytics(): Promise<PersonnelAnalytics> {
  const syncedAt = new Date().toISOString()

  try {
    const recapCsv = await fetchPersonnelRecapCsv()
    const recapRows = parseCsv(recapCsv)
    const fromRecap = parsePersonnelRecap(recapRows)

    if (fromRecap) {
      return {
        ...fromRecap,
        lastUpdated: syncedAt,
      }
    }
  } catch {
    // recap tab missing or unreachable — fall through to roster
  }

  // Let errors propagate so unstable_cache does NOT cache failures.
  // The loader's try/catch handles UI gracefully; retrying on next page load.
  const fromRoster = await loadPersonnelAnalyticsFromRoster()
  return {
    ...fromRoster,
    lastUpdated: syncedAt,
  }
}

export const PERSONNEL_ANALYTICS_CACHE_TAG = "personnel-analytics-recap-v2"

/** Cached until manual refresh — no repeat Google Sheet fetch on revisit. */
const getCachedPersonnelAnalytics = unstable_cache(
  loadPersonnelAnalytics,
  [PERSONNEL_ANALYTICS_CACHE_TAG],
  { revalidate: false, tags: [PERSONNEL_ANALYTICS_CACHE_TAG] },
)

export async function getPersonnelAnalytics(): Promise<PersonnelAnalytics> {
  return getCachedPersonnelAnalytics()
}
