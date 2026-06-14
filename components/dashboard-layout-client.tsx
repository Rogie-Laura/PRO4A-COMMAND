"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AppBrandMark } from "@/components/dashboard/app-brand-mark"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type { AccessKeyRole } from "@/lib/auth/roles"

type DashboardLayoutClientProps = {
  role: AccessKeyRole
  children: React.ReactNode
}

export function DashboardLayoutClient({ role, children }: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AppBrandMark priority />
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
