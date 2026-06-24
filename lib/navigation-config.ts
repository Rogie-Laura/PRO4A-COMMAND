import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Building2,
  Car,
  Crosshair,
  FileText,
  GitCompareArrows,
  GraduationCap,
  HeartPulse,
  MapPinned,
  Monitor,
  Scale,
  Search,
  Settings,
  Shield,
  UserCog,
  Users,
} from "lucide-react"

export type NavLink = {
  title: string
  href: string
  icon: LucideIcon
}

export type NavGroup = {
  type: "group"
  title: string
  icon: LucideIcon
  items: NavLink[]
}

export type NavLinkEntry = {
  type: "link"
  title: string
  href: string
  icon: LucideIcon
}

export type NavEntry = NavLinkEntry | NavGroup

export const MAIN_NAV: NavEntry[] = [
  { type: "link", title: "RPRMD", href: "/", icon: BarChart3 },
  { type: "link", title: "RID", href: "/rid", icon: Search },
  { type: "link", title: "ROD", href: "/police-intervention", icon: Scale },
  {
    type: "group",
    title: "RLRDD",
    icon: Car,
    items: [
      { title: "Mobility", href: "/mobility", icon: Car },
      { title: "Firearms", href: "/firearms", icon: Crosshair },
      { title: "Camps and Offices", href: "/camps-offices", icon: Building2 },
    ],
  },
  { type: "link", title: "RCADD", href: "/rcadd", icon: Users },
  { type: "link", title: "RCD", href: "/rcd", icon: FileText },
  {
    type: "group",
    title: "RIDMD",
    icon: Shield,
    items: [
      { title: "Crime Statistics", href: "/crime-statistics", icon: Shield },
      {
        title: "Comparative Crime Stats",
        href: "/comparative-crime-stats",
        icon: GitCompareArrows,
      },
    ],
  },
  {
    type: "group",
    title: "RETD",
    icon: GraduationCap,
    items: [
      {
        title: "Trainings and Education",
        href: "/trainings-and-education",
        icon: GraduationCap,
      },
    ],
  },
  { type: "link", title: "RPSMD", href: "/rpsmd", icon: UserCog },
  {
    type: "group",
    title: "RICTMD",
    icon: Monitor,
    items: [
      {
        title: "Inventory of ICT Equipment",
        href: "/ict-equipment-inventory",
        icon: Monitor,
      },
    ],
  },
  { type: "link", title: "Health and BMI", href: "/health-and-bmi", icon: HeartPulse },
  { type: "link", title: "Station Profiles", href: "/station-profiles", icon: MapPinned },
  { type: "link", title: "Settings", href: "/settings", icon: Settings },
]

export function isNavLinkActive(pathname: string, href: string) {
  return pathname === href
}

export function isNavGroupActive(pathname: string, items: NavLink[]) {
  return items.some((item) => isNavLinkActive(pathname, item.href))
}

export function getOpenNavGroups(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {}

  for (const entry of MAIN_NAV) {
    if (entry.type === "group" && isNavGroupActive(pathname, entry.items)) {
      open[entry.title] = true
    }
  }

  return open
}
