import { unstable_cache } from "next/cache"

import { fetchPatrolUnitCountsFromPatrollers } from "@/lib/patrollers-counts"

export const PATROL_INTERVENTION_CACHE_TAG = "patrol-intervention-counts-v2"

/** Cached until manual refresh (same idea as Personnel Stats — no repeat fetch on revisit). */
const getCachedPatrolInterventionAnalytics = unstable_cache(
  fetchPatrolUnitCountsFromPatrollers,
  [PATROL_INTERVENTION_CACHE_TAG],
  { revalidate: false, tags: [PATROL_INTERVENTION_CACHE_TAG] },
)

export async function getPatrolInterventionAnalytics() {
  return getCachedPatrolInterventionAnalytics()
}
