"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Lock } from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { AppBrandMark } from "@/components/dashboard/app-brand-mark"
import type { AppSession } from "@/lib/auth/get-session"
import { isDivisionUploader, isSuperAdmin } from "@/lib/auth/roles"
import { getSessionHomeHref } from "@/lib/auth/session-access"
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
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  session: AppSession
}

function isLinkAccessible(link: NavLink, session: AppSession) {
  if (link.uploadOnly) {
    return (
      isDivisionUploader(session.role) &&
      Boolean(link.divisionId && link.divisionId === session.divisionScope)
    )
  }

  if (isSuperAdmin(session.role) || session.role === "officer") {
    return true
  }

  if (isDivisionUploader(session.role)) {
    if (link.href === "/settings") return true
    return Boolean(link.divisionId && link.divisionId === session.divisionScope)
  }

  return true
}

function shouldRenderLink(link: NavLink, session: AppSession) {
  if (link.hidden) return false

  if (link.uploadOnly) {
    return isDivisionUploader(session.role)
  }

  return true
}

function NavLinkItem({
  link,
  pathname,
  isMobile,
  showNavTooltip,
  accessible,
}: {
  link: NavLink
  pathname: string
  isMobile: boolean
  showNavTooltip: boolean
  accessible: boolean
}) {
  const { setOpenMobile } = useSidebar()
  const Icon: LucideIcon = link.icon
  const isActive = accessible && isNavLinkActive(pathname, link)

  if (!accessible) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          disabled
          className="cursor-not-allowed opacity-60"
          tooltip={
            showNavTooltip
              ? `${link.title} — not available for your access token`
              : undefined
          }
        >
          <Icon className="text-muted-foreground/70" />
          <span className="text-muted-foreground/70">{link.title}</span>
          <Lock className="ml-auto size-3.5 text-muted-foreground/50" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={
          showNavTooltip
            ? link.description
              ? `${link.title} — ${link.description}`
              : link.title
            : undefined
        }
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

export function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const showNavTooltip = !isMobile && state === "collapsed"
  const homeHref = getSessionHomeHref(session)

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href={homeHref}
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
              {MAIN_NAV.filter((link) => shouldRenderLink(link, session)).map((link) => (
                <NavLinkItem
                  key={`${link.href}-${link.title}`}
                  link={link}
                  pathname={pathname}
                  isMobile={isMobile}
                  showNavTooltip={showNavTooltip}
                  accessible={isLinkAccessible(link, session)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isDivisionUploader(session.role) && session.divisionScope ? (
          <div className="px-4 pb-2">
            <p
              className={cn(
                "rounded-lg border border-sidebar-border bg-sidebar-accent/60 px-3 py-2 text-xs text-muted-foreground",
              )}
            >
              Focal access: <span className="font-medium text-foreground">{session.label}</span>
            </p>
          </div>
        ) : null}
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
