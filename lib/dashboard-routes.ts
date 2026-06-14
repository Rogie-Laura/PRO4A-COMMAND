export type DashboardRouteMeta = {
  title: string
  description?: string
}

export const DASHBOARD_ROUTE_META: Record<string, DashboardRouteMeta> = {
  "/": { title: "Personnel Stats" },
  "/mobility": {
    title: "Mobility",
    description: "Regional fleet registry and vehicle distribution",
  },
  "/firearms": { title: "Firearms" },
  "/camps-offices": { title: "Camps and Offices" },
  "/crime-statistics": { title: "Crime Statistics" },
  "/police-intervention": { title: "Police Intervention" },
  "/ict-equipment-inventory": {
    title: "Inventory of ICT Equipment",
    description: "Regional ICT assets and equipment registry",
  },
  "/health-and-bmi": {
    title: "Health and BMI",
    description: "Personnel body mass index classification",
  },
  "/station-profiles": { title: "Station Profiles" },
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
