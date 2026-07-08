"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { validateAccessKey } from "@/lib/auth/login"
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from "@/lib/auth/session"
import { getSessionHomeHref } from "@/lib/auth/get-session"

export type LoginActionResult = {
  error?: string
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  )
}

export async function loginWithAccessKeyAction(
  accessKey: string,
  rememberDevice: boolean,
  nextPath?: string,
): Promise<LoginActionResult> {
  try {
    const validated = await validateAccessKey(accessKey)
    const session = await createSessionToken(
      validated.id,
      validated.label,
      validated.role,
      rememberDevice,
      validated.expires_at,
      validated.division_scope,
    )
    const cookieStore = await cookies()

    cookieStore.set(getSessionCookieName(), session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getSessionMaxAge(validated.role, rememberDevice, validated.expires_at),
    })

    const homeHref = getSessionHomeHref({
      role: validated.role,
      divisionScope: validated.division_scope,
    })

    const safeNext =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login")
        ? nextPath
        : homeHref

    redirect(safeNext)
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(getSessionCookieName())
  redirect("/login")
}
