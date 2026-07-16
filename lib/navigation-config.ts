import type { LucideIcon } from "lucide-react"
import {
  Activity,
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
import { DIVISION_CONFIG, RMDU_NAV } from "@/lib/division-scope"
import { DIVISION_NAV_LOGOS, PRO4A_LOGO } from "@/lib/brand-config"

export type NavLink = {
  title: string
  href: string
  icon: LucideIcon
  /** Division / section logo shown in the sidebar instead of the Lucide icon. */
  logoSrc?: string
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
  {
    title: "PRO4A Status",
    href: "/pro4a-status",
    icon: Activity,
    logoSrc: PRO4A_LOGO.src,
    description: "Regional ranking, alert level, and terrorism threat status",
  },
  { title: "RPRMD", href: "/rprmd", icon: BarChart3, logoSrc: DIVISION_NAV_LOGOS.rprmd, description: DIVISION_CONFIG.rprmd.fullName, activePaths: ["/rprmd", "/rprmd/upload"], divisionId: "rprmd" },
  { title: "RID", href: "/rid", icon: Search, logoSrc: DIVISION_NAV_LOGOS.rid, description: DIVISION_CONFIG.rid.fullName, divisionId: "rid" },
  {
    title: "ROD",
    href: "/police-intervention",
    icon: Scale,
    logoSrc: DIVISION_NAV_LOGOS.rod,
    description: DIVISION_CONFIG.rod.fullName,
    activePaths: ["/police-intervention"],
    divisionId: "rod",
  },
  {
    title: "RLRDD",
    href: "/rlrdd",
    icon: Car,
    logoSrc: DIVISION_NAV_LOGOS.rlrdd,
    description: DIVISION_CONFIG.rlrdd.fullName,
    activePaths: ["/rlrdd", "/mobility", "/firearms", "/camps-offices"],
    divisionId: "rlrdd",
  },
  { title: "RCADD", href: "/rcadd", icon: Users, logoSrc: DIVISION_NAV_LOGOS.rcadd, description: DIVISION_CONFIG.rcadd.fullName, divisionId: "rcadd" },
  { title: "RCD", href: "/rcd", icon: FileText, description: DIVISION_CONFIG.rcd.fullName, divisionId: "rcd" },
  {
    title: "RIDMD",
    href: "/ridmd",
    icon: Shield,
    description: DIVISION_CONFIG.ridmd.fullName,
    activePaths: ["/ridmd", "/ridmd/upload", "/crime-statistics", "/comparative-crime-stats"],
    divisionId: "ridmd",
  },
  {
    title: "RETD",
    href: "/trainings-and-education",
    icon: GraduationCap,
    logoSrc: DIVISION_NAV_LOGOS.retd,
    description: DIVISION_CONFIG.retd.fullName,
    activePaths: ["/trainings-and-education", "/trainings-and-education/upload"],
    divisionId: "retd",
  },
  { title: "RPSMD", href: "/rpsmd", icon: UserCog, logoSrc: DIVISION_NAV_LOGOS.rpsmd, description: DIVISION_CONFIG.rpsmd.fullName, divisionId: "rpsmd" },
  {
    title: "RICTMD",
    href: "/ict-equipment-inventory",
    icon: Monitor,
    logoSrc: DIVISION_NAV_LOGOS.rictmd,
    description: DIVISION_CONFIG.rictmd.fullName,
    activePaths: ["/ict-equipment-inventory", "/ict-equipment-inventory/upload"],
    divisionId: "rictmd",
  },
  {
    title: RMDU_NAV.title,
    href: RMDU_NAV.href,
    icon: HeartPulse,
    logoSrc: DIVISION_NAV_LOGOS.rmdu,
    description: RMDU_NAV.fullName,
    divisionId: "rictmd",
  },
  { title: "Station Profiles", href: "/station-profiles", icon: MapPinned, hidden: true },
  {
    title: "Upload File",
    href: "/rprmd/upload",
    icon: Upload,
    activePaths: ["/rprmd/upload"],
    divisionId: "rprmd",
    uploadOnly: true,
  },
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
    href: "/rid/upload",
    icon: Upload,
    activePaths: ["/rid/upload"],
    divisionId: "rid",
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
    href: "/rcadd/upload",
    icon: Upload,
    activePaths: ["/rcadd/upload"],
    divisionId: "rcadd",
    uploadOnly: true,
  },
  {
    title: "Upload File",
    href: "/trainings-and-education/upload",
    icon: Upload,
    activePaths: ["/trainings-and-education/upload"],
    divisionId: "retd",
    uploadOnly: true,
  },
  {
    title: "Upload File",
    href: "/ict-equipment-inventory/upload",
    icon: Upload,
    activePaths: ["/ict-equipment-inventory/upload"],
    divisionId: "rictmd",
    uploadOnly: true,
  },
  {
    title: "Upload File",
    href: "/ridmd/upload",
    icon: Upload,
    activePaths: ["/ridmd/upload"],
    divisionId: "ridmd",
    uploadOnly: true,
  },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function isNavLinkActive(pathname: string, link: NavLink) {
  if (pathname === link.href) return true
  return link.activePaths?.includes(pathname) ?? false
}

/** Best-matching sidebar nav item for the current route (used by the app header). */
export function getActiveNavLink(pathname: string): NavLink | undefined {
  const candidates = MAIN_NAV.filter(
    (link) => !link.hidden && !link.uploadOnly && isNavLinkActive(pathname, link),
  )

  return candidates.find((link) => link.href === pathname) ?? candidates[0]
}
