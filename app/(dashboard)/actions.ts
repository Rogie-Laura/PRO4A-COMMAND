"use server"

import { updateTag } from "next/cache"

import { ADMIN_HOLDING_ANALYTICS_CACHE_TAG } from "@/lib/admin-holding-analytics"
import { PERSONNEL_ANALYTICS_CACHE_TAG } from "@/lib/personnel-analytics"

export async function refreshPersonnelStatsData() {
  updateTag(PERSONNEL_ANALYTICS_CACHE_TAG)
  updateTag(ADMIN_HOLDING_ANALYTICS_CACHE_TAG)
}
