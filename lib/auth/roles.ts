export const ACCESS_KEY_ROLES = [
  {
    id: "super_admin",
    label: "Super Admin Key",
    description: "Lifetime · full access including Settings",
  },
  {
    id: "officer",
    label: "Officers Key",
    description: "Expires · dashboard only, no Settings",
  },
] as const

export type AccessKeyRole = (typeof ACCESS_KEY_ROLES)[number]["id"]

export const OFFICER_EXPIRATION_OPTIONS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
] as const

export function isSuperAdmin(role: AccessKeyRole) {
  return role === "super_admin"
}

export function computeOfficerExpiresAt(days: number) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt.toISOString()
}
