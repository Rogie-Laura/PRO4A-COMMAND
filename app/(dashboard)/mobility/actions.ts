"use server"

import { updateTag } from "@/lib/dashboard-cache"

import { MOBILITY_ANALYTICS_CACHE_TAG } from "@/lib/mobility-analytics"

export async function refreshMobilityData() {
  updateTag(MOBILITY_ANALYTICS_CACHE_TAG)
}
