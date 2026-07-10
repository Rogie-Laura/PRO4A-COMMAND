import { cookies } from "next/headers"

import type { AccessKeyRole } from "@/lib/auth/roles"
import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session"
import {
  canSessionAccessPath,
  getSessionHomeHref,
  normalizeDivisionScope,
  type SessionAccessProfile,
} from "@/lib/auth/session-access"
import type { DivisionId } from "@/lib/division-scope"

export type AppSession = SessionAccessProfile & {
  apiKeyId: string
  label: string
  role: AccessKeyRole
  divisionScope: DivisionId | null
}

export async function getSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value

  if (!token) {
    return null
  }

  try {
    const session = await verifySessionToken(token)
    return {
      apiKeyId: session.apiKeyId,
      label: session.label,
      role: session.role,
      divisionScope: normalizeDivisionScope(session.divisionScope),
    }
  } catch {
    return null
  }
}

export async function requireSuperAdminSession() {
  const session = await getSession()

  if (!session || session.role !== "super_admin") {
    throw new Error("Super admin access required.")
  }

  return session
}

export async function requireDivisionUploadSession(divisionId: DivisionId) {
  const session = await getSession()

  if (!session) {
    throw new Error("Sign in required.")
  }

  if (session.role === "super_admin") {
    return session
  }

  if (session.role === "division_uploader" && session.divisionScope === divisionId) {
    return session
  }

  throw new Error("Division upload access required.")
}

export async function requireAlertLevelManageSession() {
  const session = await getSession()

  if (!session) {
    throw new Error("Sign in required.")
  }

  if (session.role === "super_admin") {
    return session
  }

  if (session.role === "division_uploader" && session.divisionScope === "rod") {
    return session
  }

  throw new Error("Alert level settings access required.")
}

export { canSessionAccessPath, getSessionHomeHref }
