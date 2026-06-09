export const KEY_LEADERSHIP_SLOTS = [
  {
    id: "rd",
    label: "Regional Director",
    match: (designation: string) => /^regional director/i.test(designation.trim()),
  },
  {
    id: "admin",
    label: "Dep RD for Admin",
    match: (designation: string) => /dep rd for admin/i.test(designation),
  },
  {
    id: "opns",
    label: "Dep RD for Opns",
    match: (designation: string) => /dep rd for opns/i.test(designation),
  },
  {
    id: "staff",
    label: "Chief of Regional Staff",
    match: (designation: string) => /chief of regional staff/i.test(designation),
  },
] as const

export function getRankInsigniaPath(rank: string) {
  const normalized = rank.trim().toUpperCase()
  return `/insignia/${normalized}.png`
}
