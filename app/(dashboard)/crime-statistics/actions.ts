"use server"

import { updateTag } from "next/cache"

import { CRIME_ANALYTICS_CACHE_TAG } from "@/lib/crime-analytics"

export async function refreshCrimeStatisticsData() {
  updateTag(CRIME_ANALYTICS_CACHE_TAG)
}
