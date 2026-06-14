"use client"

import { usePathname } from "next/navigation"

import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getDashboardRouteMeta } from "@/lib/dashboard-routes"
import type { AccessKeyRole } from "@/lib/auth/roles"

type DashboardShellProps = {
  role: AccessKeyRole
  children: React.ReactNode
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname()
  const { title, description } = getDashboardRouteMeta(pathname)

  return (
    <DashboardLayoutClient title={title} description={description} role={role}>
      {children}
    </DashboardLayoutClient>
  )
}
