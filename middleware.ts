import { NextResponse, type NextRequest } from "next/server"

import { canSessionAccessPath, getSessionHomeHref, normalizeDivisionScope } from "@/lib/auth/session-access"
import type { AccessKeyRole } from "@/lib/auth/roles"
import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session"

const PUBLIC_PATHS = ["/login", "/digital-launch"]
const CEREMONY_PATHS = ["/digital-launch"]

function isPatrollersApi(pathname: string) {
  return pathname.startsWith("/api/establishments/")
}

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/insignia") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico"
  )
}

function toAppSession(session: Awaited<ReturnType<typeof verifySessionToken>>) {
  return {
    apiKeyId: session.apiKeyId,
    label: session.label,
    role: session.role as AccessKeyRole,
    divisionScope: normalizeDivisionScope(session.divisionScope),
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicAsset(pathname)) {
    return NextResponse.next()
  }

  if (isPatrollersApi(pathname)) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get(getSessionCookieName())?.value
  let session: Awaited<ReturnType<typeof verifySessionToken>> | null = null

  if (sessionToken) {
    try {
      session = await verifySessionToken(sessionToken)
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete(getSessionCookieName())
      return response
    }
  }

  if (session) {
    const appSession = toAppSession(session)

    if (pathname === "/login") {
      return NextResponse.redirect(new URL(getSessionHomeHref(appSession), request.url))
    }

    if (CEREMONY_PATHS.includes(pathname)) {
      return NextResponse.next()
    }

    if (!canSessionAccessPath(appSession, pathname)) {
      return NextResponse.redirect(new URL(getSessionHomeHref(appSession), request.url))
    }

    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)

  if (pathname !== "/") {
    loginUrl.searchParams.set("next", pathname)
  }

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
