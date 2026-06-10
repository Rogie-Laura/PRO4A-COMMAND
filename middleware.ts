import { NextResponse, type NextRequest } from "next/server"

import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session"

const PUBLIC_PATHS = ["/login"]

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicAsset(pathname)) {
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
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url))
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
