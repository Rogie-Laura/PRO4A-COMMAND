"use server"

import { updateTag } from "@/lib/dashboard-cache"

import { TRAININGS_ANALYTICS_CACHE_TAG } from "@/lib/trainings-records"

export async function refreshTrainingsData() {
  updateTag(TRAININGS_ANALYTICS_CACHE_TAG)
}
