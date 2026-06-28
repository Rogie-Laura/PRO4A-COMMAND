import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Car,
  FileText,
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
  /** Shown in sidebar tooltip when collapsed. */
  description?: string
  /** Additional routes that should highlight this nav item as active. */
  activePaths?: string[]
}

export const MAIN_NAV: NavLink[] = [
  { title: "RPRMD", href: "/", icon: BarChart3 },
  { title: "RID", href: "/rid", icon: Search },
  {
    title: "ROD",
    href: "/police-intervention",
    icon: Scale,
    activePaths: ["/police-intervention"],
  },
  {
    title: "RLRDD",
    href: "/rlrdd",
    icon: Car,
    activePaths: ["/rlrdd", "/mobility", "/firearms", "/camps-offices"],
  },
  { title: "RCADD", href: "/rcadd", icon: Users },
  { title: "RCD", href: "/rcd", icon: FileText },
  {
    title: "RIDMD",
    href: "/ridmd",
    icon: Shield,
    description: "Regional Investigation and Detection Management Division",
    activePaths: ["/ridmd", "/crime-statistics", "/comparative-crime-stats"],
  },
  {
    title: "RETD",
    href: "/trainings-and-education",
    icon: GraduationCap,
    activePaths: ["/trainings-and-education"],
  },
  { title: "RPSMD", href: "/rpsmd", icon: UserCog },
  {
    title: "RICTMD",
    href: "/ict-equipment-inventory",
    icon: Monitor,
    activePaths: ["/ict-equipment-inventory"],
  },
  { title: "Health and BMI", href: "/health-and-bmi", icon: HeartPulse },
  { title: "Station Profiles", href: "/station-profiles", icon: MapPinned },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function isNavLinkActive(pathname: string, link: NavLink) {
  if (pathname === link.href) return true
  return link.activePaths?.includes(pathname) ?? false
}
