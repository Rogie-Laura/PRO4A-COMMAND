"use server"

import { updateTag } from "next/cache"

import { ADMIN_HOLDING_ANALYTICS_CACHE_TAG } from "@/lib/admin-holding-analytics"
import { PERSONNEL_ANALYTICS_CACHE_TAG } from "@/lib/personnel-analytics"
import { DETAILED_PERSONNEL_CACHE_TAGS } from "@/lib/detailed-personnel-analytics"
import {
  SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG,
  SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG,
} from "@/lib/schooling-analytics"

export async function refreshPersonnelStatsData() {
  updateTag(PERSONNEL_ANALYTICS_CACHE_TAG)
  updateTag(ADMIN_HOLDING_ANALYTICS_CACHE_TAG)
  updateTag(SCHOOLING_MANDATORY_ANALYTICS_CACHE_TAG)
  updateTag(SCHOOLING_SPECIALIZED_ANALYTICS_CACHE_TAG)
  for (const tag of DETAILED_PERSONNEL_CACHE_TAGS) {
    updateTag(tag)
  }
}
