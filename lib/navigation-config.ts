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
  Upload,
  UserCog,
  Users,
} from "lucide-react"

import type { DivisionId } from "@/lib/division-scope"

export type NavLink = {
  title: string
  href: string
  icon: LucideIcon
  /** Shown in sidebar tooltip when collapsed. */
  description?: string
  /** Additional routes that should highlight this nav item as active. */
  activePaths?: string[]
  /** Temporarily hide from sidebar navigation. */
  hidden?: boolean
  /** Division that owns this nav item for scoped focal tokens. */
  divisionId?: DivisionId
  /** Only visible to division uploaders with matching scope. */
  uploadOnly?: boolean
}

export const MAIN_NAV: NavLink[] = [
  { title: "RPRMD", href: "/", icon: BarChart3, divisionId: "rprmd" },
  { title: "RID", href: "/rid", icon: Search, divisionId: "rid" },
  {
    title: "ROD",
    href: "/police-intervention",
    icon: Scale,
    activePaths: ["/police-intervention"],
    divisionId: "rod",
  },
  {
    title: "RLRDD",
    href: "/rlrdd",
    icon: Car,
    activePaths: ["/rlrdd", "/mobility", "/firearms", "/camps-offices"],
    divisionId: "rlrdd",
  },
  { title: "RCADD", href: "/rcadd", icon: Users, divisionId: "rcadd" },
  { title: "RCD", href: "/rcd", icon: FileText, hidden: true, divisionId: "rcd" },
  {
    title: "RIDMD",
    href: "/ridmd",
    icon: Shield,
    description: "Regional Investigation and Detection Management Division",
    activePaths: ["/ridmd", "/crime-statistics", "/comparative-crime-stats"],
    divisionId: "ridmd",
  },
  {
    title: "RETD",
    href: "/trainings-and-education",
    icon: GraduationCap,
    activePaths: ["/trainings-and-education"],
    divisionId: "retd",
  },
  { title: "RPSMD", href: "/rpsmd", icon: UserCog, divisionId: "rpsmd" },
  {
    title: "RICTMD",
    href: "/ict-equipment-inventory",
    icon: Monitor,
    activePaths: ["/ict-equipment-inventory"],
    divisionId: "rictmd",
  },
  {
    title: "Health and BMI",
    href: "/health-and-bmi",
    icon: HeartPulse,
    divisionId: "rictmd",
  },
  { title: "Station Profiles", href: "/station-profiles", icon: MapPinned, hidden: true },
  {
    title: "Upload File",
    href: "/rlrdd/upload",
    icon: Upload,
    activePaths: ["/rlrdd/upload"],
    divisionId: "rlrdd",
    uploadOnly: true,
  },
  {
    title: "Upload File",
    href: "/rpsmd/upload",
    icon: Upload,
    activePaths: ["/rpsmd/upload"],
    divisionId: "rpsmd",
    uploadOnly: true,
  },
  {
    title: "Upload File",
    href: "/police-intervention/upload",
    icon: Upload,
    activePaths: ["/police-intervention/upload"],
    divisionId: "rod",
    uploadOnly: true,
  },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function isNavLinkActive(pathname: string, link: NavLink) {
  if (pathname === link.href) return true
  return link.activePaths?.includes(pathname) ?? false
}
