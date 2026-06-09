export type LeadershipSlot = {
  id: string
  label: string
  match: (designation: string) => boolean
  subUnit?: string
}

export const REGIONAL_COMMAND_GROUP_SLOTS: LeadershipSlot[] = [
  {
    id: "rd",
    label: "Regional Director",
    match: (designation) => /^regional director/i.test(designation.trim()),
  },
  {
    id: "admin",
    label: "Dep RD for Admin",
    match: (designation) => /dep rd for admin/i.test(designation),
  },
  {
    id: "opns",
    label: "Dep RD for Opns",
    match: (designation) => /dep rd for opns/i.test(designation),
  },
  {
    id: "staff",
    label: "Chief of Regional Staff",
    match: (designation) => /chief of regional staff/i.test(designation),
  },
]

export const R_STAFF_SLOTS: LeadershipSlot[] = [
  {
    id: "rprmd",
    label: "C, RPRMD",
    match: (designation) => /^C,?\s*RPRMD/i.test(designation.trim()),
  },
  {
    id: "rid",
    label: "C, RID (Acting)",
    match: (designation) => /^C,?\s*RID(?:\s|\(|$)/i.test(designation.trim()),
  },
  {
    id: "rod",
    label: "C, ROD",
    match: (designation) => /^C,?\s*ROD/i.test(designation.trim()),
  },
  {
    id: "rlrdd",
    label: "C, RLRDD",
    match: (designation) => /^C,?\s*RLRDD/i.test(designation.trim()),
  },
  {
    id: "rcadd",
    label: "C, RCADD",
    match: (designation) => /^C,?\s*RCADD/i.test(designation.trim()),
  },
  {
    id: "rcd",
    label: "C, RCD",
    match: (designation) => /^C,?\s*RCD(?:\s|\(|$)/i.test(designation.trim()),
  },
  {
    id: "ridmd",
    label: "C, RIDMD",
    match: (designation) => /^C,?\s*RIDMD/i.test(designation.trim()),
  },
  {
    id: "retd",
    label: "C, RETD",
    match: (designation) => /^C,?\s*RETD/i.test(designation.trim()),
  },
  {
    id: "rpsmd",
    label: "C, RPSMD",
    match: (designation) => /^C,?\s*RPSMD/i.test(designation.trim()),
  },
  {
    id: "rictmd",
    label: "C, RICTMD",
    match: (designation) => /^C,?\s*RICTMD/i.test(designation.trim()),
  },
]

export const PROVINCIAL_DIRECTOR_SLOTS: LeadershipSlot[] = [
  {
    id: "cavite-pd",
    label: "Provincial Director, Cavite PPO",
    subUnit: "CAVITE POLICE PROVINCIAL OFFICE",
    match: (designation) => /provincial director/i.test(designation),
  },
  {
    id: "laguna-pd",
    label: "Provincial Director, Laguna PPO",
    subUnit: "LAGUNA POLICE PROVINCIAL OFFICE",
    match: (designation) => /provincial director/i.test(designation),
  },
  {
    id: "batangas-pd",
    label: "Provincial Director, Batangas PPO",
    subUnit: "BATANGAS POLICE PROVINCIAL OFFICE",
    match: (designation) => /provincial director/i.test(designation),
  },
  {
    id: "rizal-pd",
    label: "Provincial Director, Rizal PPO",
    subUnit: "RIZAL POLICE PROVINCIAL OFFICE",
    match: (designation) => /provincial director/i.test(designation),
  },
  {
    id: "quezon-pd",
    label: "Provincial Director, Quezon PPO",
    subUnit: "QUEZON POLICE PROVINCIAL OFFICE",
    match: (designation) => /provincial director/i.test(designation),
  },
  {
    id: "rmfb-fc",
    label: "Force Commander, RMFB4A",
    subUnit: "REGIONAL MOBILE FORCE BATTALION",
    match: (designation) =>
      /^force commander/i.test(designation) && !/deputy/i.test(designation),
  },
]

/** @deprecated Use REGIONAL_COMMAND_GROUP_SLOTS */
export const KEY_LEADERSHIP_SLOTS = REGIONAL_COMMAND_GROUP_SLOTS

export function getRankInsigniaPath(rank: string) {
  const normalized = rank.trim().toUpperCase()
  return `/insignia/${normalized}.png`
}
