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
  "rhsu",
] as const

export type DivisionId = (typeof DIVISION_IDS)[number]

export type DivisionConfig = {
  id: DivisionId
  label: string
  /** Full division name shown in the app header and nav tooltips. */
  fullName: string
  rNumber?: number
  defaultHref: string
  allowedPaths: string[]
  uploadPath?: string
}

export const DIVISION_CONFIG: Record<DivisionId, DivisionConfig> = {
  rprmd: {
    id: "rprmd",
    label: "RPRMD",
    fullName: "Regional Personnel Records Management Division",
    rNumber: 1,
    defaultHref: "/rprmd",
    allowedPaths: ["/rprmd", "/rprmd/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rprmd/upload",
  },
  rid: {
    id: "rid",
    label: "RID",
    fullName: "Regional Intelligence Division",
    rNumber: 2,
    defaultHref: "/rid",
    allowedPaths: ["/rid", "/rid/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rid/upload",
  },
  rod: {
    id: "rod",
    label: "ROD",
    fullName: "Regional Operations Division",
    rNumber: 3,
    defaultHref: "/police-intervention",
    allowedPaths: ["/police-intervention", "/police-intervention/upload", "/pro4a-status", "/settings"],
    uploadPath: "/police-intervention/upload",
  },
  rlrdd: {
    id: "rlrdd",
    label: "RLRDD",
    fullName: "Regional Logistics and Research Development Division",
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
    fullName: "Regional Community Affairs Development Division",
    rNumber: 5,
    defaultHref: "/rcadd",
    allowedPaths: ["/rcadd", "/rcadd/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rcadd/upload",
  },
  rcd: {
    id: "rcd",
    label: "RCD",
    fullName: "Regional Comptrollership Division",
    rNumber: 6,
    defaultHref: "/rcd",
    allowedPaths: ["/rcd", "/pro4a-status", "/settings"],
  },
  ridmd: {
    id: "ridmd",
    label: "RIDMD",
    fullName: "Regional Investigation and Detection Management Division",
    rNumber: 7,
    defaultHref: "/ridmd",
    allowedPaths: [
      "/ridmd",
      "/ridmd/upload",
      "/crime-statistics",
      "/comparative-crime-stats",
      "/pro4a-status",
      "/settings",
    ],
    uploadPath: "/ridmd/upload",
  },
  retd: {
    id: "retd",
    label: "RETD",
    fullName: "Regional Training and Education Division",
    rNumber: 8,
    defaultHref: "/trainings-and-education",
    allowedPaths: ["/trainings-and-education", "/trainings-and-education/upload", "/pro4a-status", "/settings"],
    uploadPath: "/trainings-and-education/upload",
  },
  rpsmd: {
    id: "rpsmd",
    label: "RPSMD",
    fullName: "Regional Police Strategic Management Division",
    rNumber: 9,
    defaultHref: "/rpsmd",
    allowedPaths: ["/rpsmd", "/rpsmd/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rpsmd/upload",
  },
  rictmd: {
    id: "rictmd",
    label: "RICTMD",
    fullName: "Regional Information and Communication Technology Management Division",
    rNumber: 10,
    defaultHref: "/ict-equipment-inventory",
    allowedPaths: [
      "/ict-equipment-inventory",
      "/ict-equipment-inventory/upload",
      "/health-and-bmi",
      "/pro4a-status",
      "/settings",
    ],
    uploadPath: "/ict-equipment-inventory/upload",
  },
  rhsu: {
    id: "rhsu",
    label: "RHSU",
    fullName: "Regional Health Service Unit",
    defaultHref: "/rhsu",
    allowedPaths: ["/rhsu", "/rhsu/upload", "/pro4a-status", "/settings"],
    uploadPath: "/rhsu/upload",
  },
}

/** RMDU lives under the RICTMD focal scope but has its own nav label. */
export const RMDU_NAV = {
  title: "RMDU",
  fullName: "Regional Medical and Dental Unit",
  href: "/health-and-bmi",
} as const

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
  label: DIVISION_CONFIG[id].rNumber
    ? `R${DIVISION_CONFIG[id].rNumber} — ${DIVISION_CONFIG[id].label}`
    : DIVISION_CONFIG[id].label,
}))
