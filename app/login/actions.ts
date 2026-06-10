"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { validateAccessKey } from "@/lib/auth/login"
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from "@/lib/auth/session"

export async function loginWithAccessKeyAction(
  accessKey: string,
  rememberDevice: boolean,
  nextPath?: string,
) {
  const validated = await validateAccessKey(accessKey)
  const session = await createSessionToken(
    validated.id,
    validated.label,
    validated.role,
    rememberDevice,
    validated.expires_at,
  )
  const cookieStore = await cookies()

  cookieStore.set(getSessionCookieName(), session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAge(validated.role, rememberDevice, validated.expires_at),
  })

  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login")
      ? validated.role === "super_admin" || nextPath !== "/settings"
        ? nextPath
        : "/"
      : "/"

  redirect(safeNext)
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(getSessionCookieName())
  redirect("/login")
}
