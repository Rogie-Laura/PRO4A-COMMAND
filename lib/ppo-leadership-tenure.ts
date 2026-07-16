import {
  calculateTenureParts,
  formatDesignationDateDisplay,
  formatTenureLabel,
  parseDesignationDate,
} from "@/lib/designation-tenure"
import type { OfficeConfig } from "@/lib/office-config"
import { OFFICES } from "@/lib/office-config"
import type { PersonnelRecord } from "@/lib/personnel-types"

export type PpoTenureRole = "provincial-director" | "chief-of-police"

export type PpoTenurePerson = {
  id: string
  role: PpoTenureRole
  rank: string
  name: string
  designation: string
  office: string
  unitStation: string
  designationDate: string
  designationDateLabel: string
  tenureLabel: string
  tenureDays: number
}

export type PpoLeadershipTenureCard = {
  id: string
  label: string
  shortLabel: string
  subUnit: string
  logo: string
  colorClass: string
  provincialDirector: PpoTenurePerson | null
  chiefsOfPolice: PpoTenurePerson[]
  chiefCount: number
}

const PPO_CARD_ORDER = [
  "CAVITE POLICE PROVINCIAL OFFICE",
  "BATANGAS POLICE PROVINCIAL OFFICE",
  "LAGUNA POLICE PROVINCIAL OFFICE",
  "RIZAL POLICE PROVINCIAL OFFICE",
  "QUEZON POLICE PROVINCIAL OFFICE",
] as const

function formatPersonName(record: PersonnelRecord) {
  const middle = record.middleName.trim()
  const middleInitial = middle ? ` ${middle.charAt(0)}.` : ""
  return `${record.lastName.trim()}, ${record.firstName.trim()}${middleInitial}`.replace(
    /,\s*$/,
    "",
  )
}

function isProvincialDirector(designation: string) {
  return /provincial\s+director/i.test(designation.trim())
}

/** COP / Acting / OIC — excludes Deputy Chief of Police. */
export function isChiefOfPolice(designation: string) {
  const trimmed = designation.trim()
  if (/deputy\s+chief\s+of\s+police/i.test(trimmed)) return false
  return /^chief\s+of\s+police(?:\s*\(.*\))?$/i.test(trimmed)
}

function toTenurePerson(
  record: PersonnelRecord,
  role: PpoTenureRole,
  index: number,
): PpoTenurePerson {
  const designationDate = record.designationDate?.trim() ?? ""
  const parsed = parseDesignationDate(designationDate)
  const parts = parsed ? calculateTenureParts(parsed) : null

  return {
    id: `${role}-${record.badgeNumber || record.lastName}-${index}`,
    role,
    rank: record.rank.trim(),
    name: formatPersonName(record),
    designation: record.designation.trim(),
    office: record.unit.trim() || "—",
    unitStation: record.station.trim() || record.subUnit.trim() || "—",
    designationDate,
    designationDateLabel: formatDesignationDateDisplay(designationDate),
    tenureLabel: parts ? formatTenureLabel(parts) : "—",
    tenureDays: parts?.totalDays ?? -1,
  }
}

function officeBySubUnit(subUnit: string): OfficeConfig | undefined {
  return OFFICES.find((office) => office.subUnit === subUnit)
}

export function buildPpoLeadershipTenure(records: PersonnelRecord[]): PpoLeadershipTenureCard[] {
  return PPO_CARD_ORDER.map((subUnit) => {
    const office = officeBySubUnit(subUnit)
    const inPpo = records.filter(
      (record) => record.subUnit.trim().toUpperCase() === subUnit,
    )

    const pdRecord =
      inPpo.find((record) => isProvincialDirector(record.designation)) ?? null

    const chiefsOfPolice = inPpo
      .filter((record) => isChiefOfPolice(record.designation))
      .map((record, index) => toTenurePerson(record, "chief-of-police", index))
      .sort((a, b) => {
        if (b.tenureDays !== a.tenureDays) return b.tenureDays - a.tenureDays
        return a.name.localeCompare(b.name)
      })

    return {
      id: subUnit,
      label: office?.label ?? subUnit,
      shortLabel: office?.shortLabel ?? "PPO",
      subUnit,
      logo: office?.logo ?? "/logos/PRO4A.png",
      colorClass: office?.colorClass ?? "bg-primary",
      provincialDirector: pdRecord
        ? toTenurePerson(pdRecord, "provincial-director", 0)
        : null,
      chiefsOfPolice,
      chiefCount: chiefsOfPolice.length,
    }
  })
}
