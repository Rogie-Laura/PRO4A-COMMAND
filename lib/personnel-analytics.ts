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
  const analytics = buildPersonnelAnalyticsFromRecords(records)

  return {
    lastUpdated: new Date().toISOString(),
    ...analytics,
  }
}

async function loadPersonnelAnalytics(): Promise<PersonnelAnalytics> {
  try {
    const recapCsv = await fetchPersonnelRecapCsv()
    const recapRows = parseCsv(recapCsv)
    const fromRecap = parsePersonnelRecap(recapRows)

    if (fromRecap) {
      return fromRecap
    }
  } catch {
    // Fall back to full roster when recap tab is missing or unreachable.
  }

  try {
    return await loadPersonnelAnalyticsFromRoster()
  } catch {
    return emptyAnalytics()
  }
}

const getCachedPersonnelAnalytics = unstable_cache(
  loadPersonnelAnalytics,
  ["personnel-analytics-recap-v1"],
  { revalidate: 600 },
)

export async function getPersonnelAnalytics(): Promise<PersonnelAnalytics> {
  return getCachedPersonnelAnalytics()
}
