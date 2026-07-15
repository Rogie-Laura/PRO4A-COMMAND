"use server"

import { updateTag } from "next/cache"

import { isBmiDrilldownCategory, type BmiCategoryId } from "@/lib/bmi-config"
import { getBmiCoveragePersonnel } from "@/lib/bmi-tracking"
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

export async function fetchBmiCoveragePersonnelAction(
  kind: "not-updated" | "newly-recorded",
): Promise<BmiPersonnelDetail[]> {
  const coverage = await getBmiCoveragePersonnel()
  return kind === "not-updated" ? coverage.notUpdated : coverage.newlyRecorded
}
