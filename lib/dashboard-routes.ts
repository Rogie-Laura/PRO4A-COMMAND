export type DashboardRouteMeta = {
  title: string
  description?: string
}

export const DASHBOARD_ROUTE_META: Record<string, DashboardRouteMeta> = {
  "/": { title: "PRO4A Status", description: "Regional status overview for CALABARZON" },
  "/pro4a-status": {
    title: "PRO4A Status",
    description: "Regional ranking, alert level, and terrorism threat status",
  },
  "/rprmd": { title: "RPRMD" },
  "/rprmd/upload": {
    title: "Upload File",
    description: "RPRMD admin holding workbook upload",
  },
  "/rid": { title: "RID" },
  "/rid/upload": {
    title: "Upload File",
    description: "RID illegal drugs, criminal gangs, surrendered CTGs, and terrorism threat uploads",
  },
  "/rcadd": { title: "RCADD" },
  "/rcadd/upload": {
    title: "Upload File",
    description: "RCADD accomplishment workbook upload",
  },
  "/rcd": { title: "RCD" },
  "/rpsmd": { title: "RPSMD" },
  "/rlrdd": {
    title: "RLRDD",
    description: "Regional Logistics, Research and Development Division",
  },
  "/ridmd": {
    title: "RIDMD",
    description: "Regional Investigation and Detection Management Division",
  },
  "/mobility": {
    title: "Mobility",
    description: "Regional fleet registry and vehicle distribution",
  },
  "/firearms": { title: "Firearms" },
  "/camps-offices": { title: "Camps and Offices" },
  "/crime-statistics": { title: "Crime Statistics" },
  "/comparative-crime-stats": {
    title: "Comparative Crime Stats",
    description: "Year-over-year and period crime volume comparison",
  },
  "/police-intervention": { title: "Police Intervention" },
  "/police-intervention/upload": {
    title: "Upload File",
    description: "ROD establishment workbook upload",
  },
  "/trainings-and-education": {
    title: "Trainings and Education",
    description: "Regional training programs and education records",
  },
  "/ict-equipment-inventory": {
    title: "Inventory of ICT Equipment",
    description: "Regional ICT assets and equipment registry",
  },
  "/ict-equipment-inventory/upload": {
    title: "Upload File",
    description: "RICTMD ICT inventory workbook upload",
  },
  "/health-and-bmi": {
    title: "Health and BMI",
    description: "Personnel body mass index classification",
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
