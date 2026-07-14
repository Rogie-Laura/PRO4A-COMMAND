"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type { AppSession } from "@/lib/auth/get-session"

type DashboardLayoutClientProps = {
  title: string
  description?: string
  session: AppSession
  children: React.ReactNode
}

export function DashboardLayoutClient({
  title,
  description,
  session,
  children,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
