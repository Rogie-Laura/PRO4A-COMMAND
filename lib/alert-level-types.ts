export const ALERT_LEVEL_IDS = ["normal", "heightened", "full_alert"] as const

export type AlertLevelId = (typeof ALERT_LEVEL_IDS)[number]

export type AlertLevelSetting = {
  level: AlertLevelId
  remarks: string | null
  updatedAt: string
  updatedByLabel: string | null
}
