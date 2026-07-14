"use server"

import { updateTag } from "next/cache"

import { ICT_EQUIPMENT_ANALYTICS_CACHE_TAG } from "@/lib/ict-equipment-records"

export async function refreshIctEquipmentData() {
  updateTag(ICT_EQUIPMENT_ANALYTICS_CACHE_TAG)
}
