"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { AppBrandMark } from "@/components/dashboard/app-brand-mark"
import type { AccessKeyRole } from "@/lib/auth/roles"
import {
  getOpenNavGroups,
  isNavGroupActive,
  isNavLinkActive,
  MAIN_NAV,
  type NavEntry,
} from "@/lib/navigation-config"
import { cn } from "@/lib/utils"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

type AppSidebarProps = {
  role: AccessKeyRole
}

function NavLinkItem({
  title,
  href,
  icon: Icon,
  pathname,
  isMobile,
  showNavTooltip,
}: {
  title: string
  href: string
  icon: LucideIcon
  pathname: string
  isMobile: boolean
  showNavTooltip: boolean
}) {
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isNavLinkActive(pathname, href)}
        tooltip={showNavTooltip ? title : undefined}
        render={(props) => (
          <Link
            {...props}
            href={href}
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
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavGroupItem({
  entry,
  pathname,
  isMobile,
  showNavTooltip,
  isOpen,
  onToggle,
}: {
  entry: Extract<NavEntry, { type: "group" }>
  pathname: string
  isMobile: boolean
  showNavTooltip: boolean
  isOpen: boolean
  onToggle: () => void
}) {
  const { setOpenMobile } = useSidebar()
  const groupActive = isNavGroupActive(pathname, entry.items)
  const Icon = entry.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={groupActive}
        tooltip={showNavTooltip ? entry.title : undefined}
        onClick={onToggle}
      >
        <Icon />
        <span>{entry.title}</span>
        <ChevronRight
          className={cn(
            "ml-auto size-4 shrink-0 transition-transform",
            isOpen && "rotate-90",
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
          {entry.items.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton
                isActive={isNavLinkActive(pathname, item.href)}
                render={(props) => (
                  <Link
                    {...props}
                    href={item.href}
                    onClick={(event) => {
                      props.onClick?.(event)
                      if (isMobile) {
                        setOpenMobile(false)
                      }
                    }}
                  />
                )}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  )
}

export function AppSidebar({ role: _role }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const showNavTooltip = !isMobile && state === "collapsed"
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    getOpenNavGroups(pathname),
  )

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  useEffect(() => {
    setOpenGroups((current) => ({
      ...current,
      ...getOpenNavGroups(pathname),
    }))
  }, [pathname])

  function toggleGroup(title: string) {
    setOpenGroups((current) => ({
      ...current,
      [title]: !current[title],
    }))
  }

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
              {MAIN_NAV.map((entry) =>
                entry.type === "link" ? (
                  <NavLinkItem
                    key={entry.href}
                    title={entry.title}
                    href={entry.href}
                    icon={entry.icon}
                    pathname={pathname}
                    isMobile={isMobile}
                    showNavTooltip={showNavTooltip}
                  />
                ) : (
                  <NavGroupItem
                    key={entry.title}
                    entry={entry}
                    pathname={pathname}
                    isMobile={isMobile}
                    showNavTooltip={showNavTooltip}
                    isOpen={Boolean(openGroups[entry.title])}
                    onToggle={() => toggleGroup(entry.title)}
                  />
                ),
              )}
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
