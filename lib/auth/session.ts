import { jwtVerify, SignJWT } from "jose"

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

export async function createSessionToken(apiKeyId: string, label: string, rememberDevice: boolean) {
  const days = rememberDevice ? REMEMBER_DAYS : SESSION_DAYS

  return new SignJWT({ label })
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

  return {
    apiKeyId: payload.sub,
    label: typeof payload.label === "string" ? payload.label : "Access Token",
  }
}

export function getSessionMaxAge(rememberDevice: boolean) {
  const days = rememberDevice ? REMEMBER_DAYS : SESSION_DAYS
  return 60 * 60 * 24 * days
}
