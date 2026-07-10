export const DIVISION_IDS = [
  "rprmd",
  "rid",
  "rod",
  "rlrdd",
  "rcadd",
  "rcd",
  "ridmd",
  "retd",
  "rpsmd",
  "rictmd",
] as const

export type DivisionId = (typeof DIVISION_IDS)[number]

export type DivisionConfig = {
  id: DivisionId
  label: string
  rNumber: number
  defaultHref: string
  allowedPaths: string[]
  uploadPath?: string
}

export const DIVISION_CONFIG: Record<DivisionId, DivisionConfig> = {
  rprmd: {
    id: "rprmd",
    label: "RPRMD",
    rNumber: 1,
    defaultHref: "/",
    allowedPaths: ["/", "/pro4a-status", "/settings"],
  },
  rid: {
    id: "rid",
    label: "RID",
    rNumber: 2,
    defaultHref: "/rid",
    allowedPaths: ["/rid", "/rid/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rid/upload",
  },
  rod: {
    id: "rod",
    label: "ROD",
    rNumber: 3,
    defaultHref: "/police-intervention",
    allowedPaths: ["/police-intervention", "/police-intervention/upload", "/pro4a-status", "/settings"],
    uploadPath: "/police-intervention/upload",
  },
  rlrdd: {
    id: "rlrdd",
    label: "RLRDD",
    rNumber: 4,
    defaultHref: "/rlrdd",
    allowedPaths: [
      "/rlrdd",
      "/mobility",
      "/firearms",
      "/camps-offices",
      "/rlrdd/upload",
      "/pro4a-status",
      "/settings",
    ],
    uploadPath: "/rlrdd/upload",
  },
  rcadd: {
    id: "rcadd",
    label: "RCADD",
    rNumber: 5,
    defaultHref: "/rcadd",
    allowedPaths: ["/rcadd", "/rcadd/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rcadd/upload",
  },
  rcd: {
    id: "rcd",
    label: "RCD",
    rNumber: 6,
    defaultHref: "/rcd",
    allowedPaths: ["/rcd", "/pro4a-status", "/settings"],
  },
  ridmd: {
    id: "ridmd",
    label: "RIDMD",
    rNumber: 7,
    defaultHref: "/ridmd",
    allowedPaths: ["/ridmd", "/crime-statistics", "/comparative-crime-stats", "/pro4a-status", "/settings"],
  },
  retd: {
    id: "retd",
    label: "RETD",
    rNumber: 8,
    defaultHref: "/trainings-and-education",
    allowedPaths: ["/trainings-and-education", "/pro4a-status", "/settings"],
  },
  rpsmd: {
    id: "rpsmd",
    label: "RPSMD",
    rNumber: 9,
    defaultHref: "/rpsmd",
    allowedPaths: ["/rpsmd", "/rpsmd/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rpsmd/upload",
  },
  rictmd: {
    id: "rictmd",
    label: "RICTMD",
    rNumber: 10,
    defaultHref: "/ict-equipment-inventory",
    allowedPaths: ["/ict-equipment-inventory", "/health-and-bmi", "/pro4a-status", "/settings"],
  },
}

export function isDivisionId(value: string | null | undefined): value is DivisionId {
  return Boolean(value && DIVISION_IDS.includes(value as DivisionId))
}

export function getDivisionConfig(divisionId: DivisionId) {
  return DIVISION_CONFIG[divisionId]
}

export function getDivisionDefaultHref(divisionId: DivisionId) {
  return DIVISION_CONFIG[divisionId].defaultHref
}

export function canDivisionAccessPath(divisionId: DivisionId, pathname: string) {
  const allowed = DIVISION_CONFIG[divisionId].allowedPaths
  return allowed.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export const DIVISION_UPLOAD_OPTIONS = DIVISION_IDS.map((id) => ({
  id,
  label: `R${DIVISION_CONFIG[id].rNumber} — ${DIVISION_CONFIG[id].label}`,
}))
