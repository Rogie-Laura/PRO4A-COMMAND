"use server"

import { updateTag } from "next/cache"

import { HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"

export async function refreshHealthAndBmiData() {
  updateTag(HEALTH_ANALYTICS_CACHE_TAG)
}
