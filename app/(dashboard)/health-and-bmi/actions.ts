"use server"

import { updateTag } from "next/cache"

import { isBmiDrilldownCategory, type BmiCategoryId } from "@/lib/bmi-config"
import { fetchBmiPersonnelForCategory, HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"
import type { BmiPersonnelDetail } from "@/lib/health-types"

export async function refreshHealthAndBmiData() {
  updateTag(HEALTH_ANALYTICS_CACHE_TAG)
}

export async function fetchBmiCategoryPersonnelAction(
  categoryId: BmiCategoryId,
): Promise<BmiPersonnelDetail[]> {
  if (!isBmiDrilldownCategory(categoryId)) {
    return []
  }

  return fetchBmiPersonnelForCategory(categoryId)
}
