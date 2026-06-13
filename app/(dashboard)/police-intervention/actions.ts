"use server"

import { updateTag } from "next/cache"

import { PATROL_INTERVENTION_CACHE_TAG } from "@/lib/patrol-intervention-analytics"

export async function refreshPatrolInterventionData() {
  updateTag(PATROL_INTERVENTION_CACHE_TAG)
}
