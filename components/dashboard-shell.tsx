"use client"

import { usePathname } from "next/navigation"

import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getDashboardRouteMeta } from "@/lib/dashboard-routes"
import type { AppSession } from "@/lib/auth/get-session"

type DashboardShellProps = {
  session: AppSession
  children: React.ReactNode
}

export function DashboardShell({ session, children }: DashboardShellProps) {
  const pathname = usePathname()
  const { title, description } = getDashboardRouteMeta(pathname)

  return (
    <DashboardLayoutClient title={title} description={description} session={session}>
      {children}
    </DashboardLayoutClient>
  )
}
