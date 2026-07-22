"use client"

import { usePathname } from "next/navigation"

import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getDashboardRouteMeta } from "@/lib/dashboard-routes"
import { getActiveNavLink } from "@/lib/navigation-config"
import type { AppSession } from "@/lib/auth/get-session"

type DashboardShellProps = {
  session: AppSession
  children: React.ReactNode
}

export function DashboardShell({ session, children }: DashboardShellProps) {
  const pathname = usePathname()
  const routeMeta = getDashboardRouteMeta(pathname)
  const activeNav = getActiveNavLink(pathname)

  const title = routeMeta.title
  const description = routeMeta.description ?? activeNav?.description

  return (
    <DashboardLayoutClient title={title} description={description} session={session}>
      <DashboardAutoRefresh />
      {children}
    </DashboardLayoutClient>
  )
}
