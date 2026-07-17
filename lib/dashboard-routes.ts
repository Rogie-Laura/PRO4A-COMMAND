import { DIVISION_CONFIG, RMDU_NAV } from "@/lib/division-scope"

export type DashboardRouteMeta = {
  title: string
  description?: string
}

function divisionMeta(divisionId: keyof typeof DIVISION_CONFIG): DashboardRouteMeta {
  const division = DIVISION_CONFIG[divisionId]
  return { title: division.label, description: division.fullName }
}

export const DASHBOARD_ROUTE_META: Record<string, DashboardRouteMeta> = {
  "/": { title: "PRO4A Status", description: "Regional status overview for CALABARZON" },
  "/pro4a-status": {
    title: "PRO4A Status",
    description: "Regional ranking, alert level, and terrorism threat status",
  },
  "/rprmd": divisionMeta("rprmd"),
  "/rprmd/upload": {
    title: "Upload File",
    description: "RPRMD admin holding workbook upload",
  },
  "/rid": divisionMeta("rid"),
  "/rid/upload": {
    title: "Upload File",
    description: "RID Intelligence Eligibility, illegal drugs, criminal gangs, surrendered CTGs, and terrorism threat uploads",
  },
  "/rcadd": divisionMeta("rcadd"),
  "/rcadd/upload": {
    title: "Upload File",
    description: "RCADD accomplishment workbook upload",
  },
  "/rcd": divisionMeta("rcd"),
  "/rpsmd": divisionMeta("rpsmd"),
  "/rlrdd": divisionMeta("rlrdd"),
  "/ridmd": divisionMeta("ridmd"),
  "/mobility": {
    title: "Mobility",
    description: DIVISION_CONFIG.rlrdd.fullName,
  },
  "/firearms": {
    title: "Firearms",
    description: DIVISION_CONFIG.rlrdd.fullName,
  },
  "/camps-offices": {
    title: "Camps and Offices",
    description: DIVISION_CONFIG.rlrdd.fullName,
  },
  "/crime-statistics": {
    title: "Crime Statistics",
    description: DIVISION_CONFIG.ridmd.fullName,
  },
  "/comparative-crime-stats": {
    title: "Comparative Crime Stats",
    description: DIVISION_CONFIG.ridmd.fullName,
  },
  "/police-intervention": divisionMeta("rod"),
  "/police-intervention/upload": {
    title: "Upload File",
    description: "ROD establishment workbook upload",
  },
  "/trainings-and-education": divisionMeta("retd"),
  "/ict-equipment-inventory": divisionMeta("rictmd"),
  "/ict-equipment-inventory/upload": {
    title: "Upload File",
    description: "RICTMD ICT inventory workbook upload",
  },
  "/health-and-bmi": {
    title: RMDU_NAV.title,
    description: RMDU_NAV.fullName,
  },
  "/rhsu": {
    title: "RHSU",
    description: "Regional Health Service Unit",
  },
  "/station-profiles": { title: "Station Profiles" },
  "/rlrdd/upload": {
    title: "Upload File",
    description: "RLRDD Excel uploads for firearms and vehicle clearbook",
  },
  "/rpsmd/upload": {
    title: "Upload File",
    description: "RPSMD UPER workbook upload from DPL",
  },
  "/settings": { title: "Settings" },
  "/reports": {
    title: "Reports",
    description: "Generate and export analytics reports",
  },
  "/activity": {
    title: "Status",
    description: "Personnel duty and assignment status",
  },
  "/users": {
    title: "Personnel",
    description: "Leadership roster and unit headcount from Google Sheets",
  },
}

export function getDashboardRouteMeta(pathname: string): DashboardRouteMeta {
  return DASHBOARD_ROUTE_META[pathname] ?? { title: "PRO4A COMMAND" }
}
