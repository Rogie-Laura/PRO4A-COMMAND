"use server"

import { updateTag } from "next/cache"

import { PERSONNEL_ANALYTICS_CACHE_TAG } from "@/lib/personnel-analytics"

export async function refreshPersonnelStatsData() {
  updateTag(PERSONNEL_ANALYTICS_CACHE_TAG)
}
