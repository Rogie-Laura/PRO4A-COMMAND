"use client"

import Image from "next/image"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type { AccessKeyRole } from "@/lib/auth/roles"

type DashboardLayoutClientProps = {
  title: string
  description?: string
  logo?: string
  role: AccessKeyRole
  children: React.ReactNode
}

export function DashboardLayoutClient({
  title,
  description,
  logo,
  role,
  children,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {logo ? (
              <Image
                src={logo}
                alt=""
                width={36}
                height={40}
                className="size-9 shrink-0 object-contain"
                priority
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
