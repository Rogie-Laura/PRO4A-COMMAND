"use server"

import { updateTag } from "next/cache"

import { TRAININGS_ANALYTICS_CACHE_TAG } from "@/lib/trainings-analytics"

export async function refreshTrainingsData() {
  updateTag(TRAININGS_ANALYTICS_CACHE_TAG)
}
