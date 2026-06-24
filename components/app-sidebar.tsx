"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { AppBrandMark } from "@/components/dashboard/app-brand-mark"
import type { AccessKeyRole } from "@/lib/auth/roles"
import { isNavLinkActive, MAIN_NAV, type NavLink } from "@/lib/navigation-config"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type AppSidebarProps = {
  role: AccessKeyRole
}

function NavLinkItem({
  link,
  pathname,
  isMobile,
  showNavTooltip,
}: {
  link: NavLink
  pathname: string
  isMobile: boolean
  showNavTooltip: boolean
}) {
  const { setOpenMobile } = useSidebar()
  const Icon: LucideIcon = link.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isNavLinkActive(pathname, link)}
        tooltip={showNavTooltip ? link.title : undefined}
        render={(props) => (
          <Link
            {...props}
            href={link.href}
            onClick={(event) => {
              props.onClick?.(event)
              if (isMobile) {
                setOpenMobile(false)
              }
            }}
          />
        )}
      >
        <Icon />
        <span>{link.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ role: _role }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const showNavTooltip = !isMobile && state === "collapsed"

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false)
            }
          }}
        >
          <AppBrandMark priority />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((link) => (
                <NavLinkItem
                  key={link.href}
                  link={link}
                  pathname={pathname}
                  isMobile={isMobile}
                  showNavTooltip={showNavTooltip}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="space-y-3 border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs font-medium">System Status</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  )
}
