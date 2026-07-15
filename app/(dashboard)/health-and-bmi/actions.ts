"use server"

import { updateTag } from "next/cache"

import { isBmiDrilldownCategory, type BmiCategoryId } from "@/lib/bmi-config"
import { getBmiMovementBucket, getBmiPersonTrend } from "@/lib/bmi-tracking"
import { fetchBmiPersonnelForCategory, HEALTH_ANALYTICS_CACHE_TAG } from "@/lib/health-analytics"
import type {
  BmiMovementBucket,
  BmiMovementPerson,
  BmiPersonnelDetail,
  BmiTrendPoint,
} from "@/lib/health-types"

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

export async function fetchBmiMovementPersonnelAction(
  bucket: BmiMovementBucket,
): Promise<BmiMovementPerson[]> {
  return getBmiMovementBucket(bucket)
}

export async function fetchBmiPersonTrendAction(
  key: string,
  filterToken: string,
): Promise<BmiTrendPoint[]> {
  return getBmiPersonTrend(key, filterToken)
}
