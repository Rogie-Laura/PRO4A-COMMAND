import type { AlertLevelId } from "@/lib/alert-level-types"

export const ALERT_LEVEL_OPTIONS: Array<{
  id: AlertLevelId
  label: string
  description: string
}> = [
  {
    id: "normal",
    label: "Normal",
    description: "Standard regional operating posture.",
  },
  {
    id: "heightened",
    label: "Heightened Alert",
    description: "Increased vigilance across CALABARZON.",
  },
  {
    id: "full_alert",
    label: "Full Alert",
    description: "Maximum readiness and coordination posture.",
  },
]

export function getAlertLevelLabel(level: AlertLevelId) {
  return ALERT_LEVEL_OPTIONS.find((option) => option.id === level)?.label ?? level
}

export function alertLevelCardClass(level: AlertLevelId) {
  if (level === "full_alert") {
    return "border-red-500/30 bg-gradient-to-br from-red-500/15 via-red-500/5 to-card"
  }
  if (level === "heightened") {
    return "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-card"
  }
  return "border-sky-500/30 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card"
}

export function alertLevelBadgeClass(level: AlertLevelId) {
  if (level === "full_alert") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
  }
  if (level === "heightened") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
}

export function alertLevelTextClass(level: AlertLevelId) {
  if (level === "full_alert") {
    return "text-red-700 dark:text-red-300"
  }
  if (level === "heightened") {
    return "text-emerald-700 dark:text-emerald-300"
  }
  return "text-sky-700 dark:text-sky-300"
}

export function isAlertLevelId(value: unknown): value is AlertLevelId {
  return typeof value === "string" && ALERT_LEVEL_OPTIONS.some((option) => option.id === value)
}

export function alertLevelSupportsRemarks(level: AlertLevelId) {
  return level === "heightened" || level === "full_alert"
}
