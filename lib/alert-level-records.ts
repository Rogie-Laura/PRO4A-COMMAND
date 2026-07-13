import { unstable_cache } from "next/cache"

import { isAlertLevelId } from "@/lib/alert-level-config"
import type { AlertLevelId, AlertLevelSetting } from "@/lib/alert-level-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const ALERT_LEVEL_CACHE_TAG = "pro4a-alert-level-v1"

const DEFAULT_ALERT_LEVEL: AlertLevelSetting = {
  level: "normal",
  remarks: null,
  updatedAt: new Date().toISOString(),
  updatedByLabel: null,
}

function mapRow(row: {
  alert_level: string
  remarks?: string | null
  updated_at: string
  updated_by_label: string | null
}): AlertLevelSetting {
  return {
    level: isAlertLevelId(row.alert_level) ? row.alert_level : "normal",
    remarks: row.remarks?.trim() || null,
    updatedAt: row.updated_at,
    updatedByLabel: row.updated_by_label,
  }
}

async function loadAlertLevelSetting(): Promise<AlertLevelSetting> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("pro4a_alert_level_settings")
    .select("alert_level, remarks, updated_at, updated_by_label")
    .eq("id", 1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapRow(data) : DEFAULT_ALERT_LEVEL
}

const getCachedAlertLevelSetting = unstable_cache(
  loadAlertLevelSetting,
  [ALERT_LEVEL_CACHE_TAG],
  {
    revalidate: false,
    tags: [ALERT_LEVEL_CACHE_TAG],
  },
)

export async function getAlertLevelSetting(): Promise<AlertLevelSetting> {
  return getCachedAlertLevelSetting()
}

export async function updateAlertLevelSetting(
  level: AlertLevelId,
  updatedByLabel: string,
  remarks?: string | null,
) {
  const supabase = createAdminClient()
  const normalizedRemarks =
    level === "normal" ? null : remarks?.trim().slice(0, 200) || null

  const { data, error } = await supabase
    .from("pro4a_alert_level_settings")
    .upsert({
      id: 1,
      alert_level: level,
      remarks: normalizedRemarks,
      updated_by_label: updatedByLabel,
      updated_at: new Date().toISOString(),
    })
    .select("alert_level, remarks, updated_at, updated_by_label")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update alert level.")
  }

  return mapRow(data)
}
