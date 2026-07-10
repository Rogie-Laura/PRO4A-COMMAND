import type { AppSession } from "@/lib/auth/get-session"

export function canManageAlertLevel(session: AppSession) {
  return (
    session.role === "super_admin" ||
    (session.role === "division_uploader" && session.divisionScope === "rod")
  )
}
