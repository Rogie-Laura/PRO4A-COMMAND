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
  const session = await createSessionToken(validated.id, validated.label, rememberDevice)
  const cookieStore = await cookies()

  cookieStore.set(getSessionCookieName(), session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAge(rememberDevice),
  })

  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login") ? nextPath : "/"

  redirect(safeNext)
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(getSessionCookieName())
  redirect("/login")
}
