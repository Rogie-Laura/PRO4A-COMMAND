"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Building2,
  Car,
  Crosshair,
  HeartPulse,
  MapPinned,
  Monitor,
  Settings,
  Shield,
  Siren,
} from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { AppBrandMark } from "@/components/dashboard/app-brand-mark"
import type { AccessKeyRole } from "@/lib/auth/roles"
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

const allNavItems = [
  { title: "Personnel Stats", href: "/", icon: BarChart3 },
  { title: "Mobility", href: "/mobility", icon: Car },
  { title: "Firearms", href: "/firearms", icon: Crosshair },
  { title: "Camps and Offices", href: "/camps-offices", icon: Building2 },
  { title: "Crime Statistics", href: "/crime-statistics", icon: Shield },
  { title: "Police Intervention", href: "/police-intervention", icon: Siren },
  { title: "Inventory of ICT Equipment", href: "/ict-equipment-inventory", icon: Monitor },
  { title: "Health and BMI", href: "/health-and-bmi", icon: HeartPulse },
  { title: "Station Profiles", href: "/station-profiles", icon: MapPinned },
  { title: "Settings", href: "/settings", icon: Settings },
]

type AppSidebarProps = {
  role: AccessKeyRole
}

export function AppSidebar({ role: _role }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const navItems = allNavItems
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={showNavTooltip ? item.title : undefined}
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
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
