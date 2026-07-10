import type { AccessKeyRole } from "@/lib/auth/roles"
import {
  canDivisionAccessPath,
  getDivisionDefaultHref,
  isDivisionId,
  type DivisionId,
} from "@/lib/division-scope"

export type SessionAccessProfile = {
  role: AccessKeyRole
  divisionScope: DivisionId | null
}

export const APP_DEFAULT_HREF = "/pro4a-status"

export function canSessionAccessPath(session: SessionAccessProfile, pathname: string) {
  if (session.role === "super_admin" || session.role === "officer") {
    return true
  }

  if (session.role === "division_uploader" && session.divisionScope) {
    return canDivisionAccessPath(session.divisionScope, pathname)
  }

  return false
}

export function getSessionHomeHref(session: SessionAccessProfile) {
  if (session.role === "division_uploader") {
    if (!session.divisionScope) {
      return "/login"
    }

    if (canDivisionAccessPath(session.divisionScope, APP_DEFAULT_HREF)) {
      return APP_DEFAULT_HREF
    }

    return getDivisionDefaultHref(session.divisionScope)
  }

  return APP_DEFAULT_HREF
}

export function normalizeDivisionScope(value: unknown): DivisionId | null {
  return typeof value === "string" && isDivisionId(value) ? value : null
}
