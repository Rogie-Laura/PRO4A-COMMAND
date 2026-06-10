import { cookies } from "next/headers"

import type { AccessKeyRole } from "@/lib/auth/roles"
import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session"

export type AppSession = {
  apiKeyId: string
  label: string
  role: AccessKeyRole
}

export async function getSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value

  if (!token) {
    return null
  }

  try {
    return await verifySessionToken(token)
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
