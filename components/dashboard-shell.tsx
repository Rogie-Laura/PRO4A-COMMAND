"use client"

import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import type { AccessKeyRole } from "@/lib/auth/roles"

type DashboardShellProps = {
  role: AccessKeyRole
  children: React.ReactNode
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  return <DashboardLayoutClient role={role}>{children}</DashboardLayoutClient>
}
