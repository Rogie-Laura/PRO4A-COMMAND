import { jwtVerify, SignJWT } from "jose"

import type { AccessKeyRole } from "@/lib/auth/roles"

const COOKIE_NAME = "pro4a_session"
const REMEMBER_DAYS = 90
const SESSION_DAYS = 1

function getSecret() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.")
  }

  return new TextEncoder().encode(secret)
}

export function getSessionCookieName() {
  return COOKIE_NAME
}

function getSessionDays(
  role: AccessKeyRole,
  rememberDevice: boolean,
  keyExpiresAt: string | null,
) {
  let days = rememberDevice ? REMEMBER_DAYS : SESSION_DAYS

  if (role === "super_admin") {
    return days
  }

  if (keyExpiresAt) {
    const msUntilExpiry = new Date(keyExpiresAt).getTime() - Date.now()
    const daysUntilExpiry = Math.max(1, Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24)))
    days = Math.min(days, daysUntilExpiry)
  }

  return days
}

export async function createSessionToken(
  apiKeyId: string,
  label: string,
  role: AccessKeyRole,
  rememberDevice: boolean,
  keyExpiresAt: string | null,
) {
  const days = getSessionDays(role, rememberDevice, keyExpiresAt)

  return new SignJWT({ label, role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(apiKeyId)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())

  if (!payload.sub) {
    throw new Error("Invalid session.")
  }

  const role = payload.role === "officer" ? "officer" : "super_admin"

  return {
    apiKeyId: payload.sub,
    label: typeof payload.label === "string" ? payload.label : "Access Token",
    role: role as AccessKeyRole,
  }
}

export function getSessionMaxAge(
  role: AccessKeyRole,
  rememberDevice: boolean,
  keyExpiresAt: string | null,
) {
  const days = getSessionDays(role, rememberDevice, keyExpiresAt)
  return 60 * 60 * 24 * days
}
