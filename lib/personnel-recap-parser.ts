import { AGE_ABOVE_56_ID, AGE_BRACKETS } from "@/lib/age-config"
import { OFFICES } from "@/lib/office-config"
import {
  PERSONNEL_RECAP_HEADERS,
  PERSONNEL_RECAP_SECTIONS,
} from "@/lib/personnel-recap-sheet"
import {
  RANK_TENURE_ABOVE_10_ID,
  RANK_TENURE_BRACKETS,
  RANK_TENURE_LESS_THAN_1_ID,
} from "@/lib/rank-tenure-config"
import { PCO_RANK_ORDER, PNCO_RANK_ORDER } from "@/lib/rank-config"
import { sortStationBreakdown } from "@/lib/station-sort"
import type {
  CountItem,
  LeadershipGroups,
  LeadershipRow,
  OfficeAgeDistributionRow,
  OfficeBreakdownItem,
  PersonnelAnalytics,
  RankTenureDistributionRow,
  RankTenurePersonDetail,
  StationBreakdownItem,
  UnitRow,
} from "@/lib/personnel-types"

function parseNumber(value: string) {
  const parsed = Number(value.replace(/,/g, "").trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function decodePersonDetail(value: string, id: string, rank: string): RankTenurePersonDetail | null {
  const parts = value.split("|")
  if (parts.length < 6) return null

  return {
    id,
    name: parts[0],
    rank,
    badgeNumber: parts[1] || "—",
    lastPromotionDate: parts[2] || "—",
    yearsInRank: parseNumber(parts[3]),
    office: parts[4] || "Unassigned",
    unit: parts[5] || "Unknown",
  }
}

function decodeLeadership(value: string, id: string, designation: string): LeadershipRow {
  const parts = value.split("|")
  const vacant = parts[2] === "1"

  return {
    id,
    rank: vacant ? "" : (parts[0] ?? ""),
    name: vacant ? "Vacant" : (parts[1] ?? "Vacant"),
    designation,
    vacant,
  }
}

function createEmptyAgeBrackets(): Record<string, number> {
  return {
    ...Object.fromEntries(AGE_BRACKETS.map((bracket) => [bracket.id, 0])),
    [AGE_ABOVE_56_ID]: 0,
  }
}

function createEmptyRankTenureBrackets(): Record<string, number> {
  return {
    [RANK_TENURE_LESS_THAN_1_ID]: 0,
    ...Object.fromEntries(RANK_TENURE_BRACKETS.map((bracket) => [bracket.id, 0])),
    [RANK_TENURE_ABOVE_10_ID]: 0,
  }
}

export function isPersonnelRecapSheet(rows: Record<string, string>[]) {
  if (rows.length === 0) return false

  const headers = Object.keys(rows[0]).map((header) => header.trim())
  return PERSONNEL_RECAP_HEADERS.every((header) => headers.includes(header))
}

export function parsePersonnelRecap(rows: Record<string, string>[]): PersonnelAnalytics | null {
  if (!isPersonnelRecapSheet(rows)) return null

  const sections = rows.filter((row) => row.Section?.trim() !== "Section")

  const getSection = (name: string) =>
    sections.filter((row) => row.Section?.trim() === name)

  const metaRows = getSection(PERSONNEL_RECAP_SECTIONS.meta)
  const generatedAt =
    metaRows.find((row) => row.Key1 === "generated_at")?.Value?.trim() ||
    new Date().toISOString()
  const totalRecords = parseNumber(
    metaRows.find((row) => row.Key1 === "record_count")?.Value ?? "0",
  )

  const workforceRows = getSection(PERSONNEL_RECAP_SECTIONS.workforce)
  const workforceValue = (key: string) =>
    parseNumber(workforceRows.find((row) => row.Key1 === key)?.Value ?? "0")

  const genderStats: CountItem[] = getSection(PERSONNEL_RECAP_SECTIONS.workforceGender).map(
    (row) => ({
      name: row.Key1,
      count: parseNumber(row.Value),
      percentage:
        totalRecords > 0
          ? Math.round((parseNumber(row.Value) / totalRecords) * 1000) / 10
          : 0,
    }),
  )

  const statusStats: CountItem[] = getSection(PERSONNEL_RECAP_SECTIONS.status)
    .map((row) => ({
      name: row.Key1,
      count: parseNumber(row.Value),
      percentage:
        totalRecords > 0
          ? Math.round((parseNumber(row.Value) / totalRecords) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const rankDistribution = {
    pco: PCO_RANK_ORDER.map((rank) => ({
      rank,
      count: parseNumber(
        getSection(PERSONNEL_RECAP_SECTIONS.rankPco).find((row) => row.Key1 === rank)?.Value ??
          "0",
      ),
    })).filter((item) => item.count > 0),
    pnco: PNCO_RANK_ORDER.map((rank) => ({
      rank,
      count: parseNumber(
        getSection(PERSONNEL_RECAP_SECTIONS.rankPnco).find((row) => row.Key1 === rank)?.Value ??
          "0",
      ),
    })).filter((item) => item.count > 0),
  }

  const officeCounts = new Map(
    getSection(PERSONNEL_RECAP_SECTIONS.office).map((row) => [row.Key1, parseNumber(row.Value)]),
  )
  const officeActive = new Map(
    getSection(PERSONNEL_RECAP_SECTIONS.officeActive).map((row) => [
      row.Key1,
      parseNumber(row.Value),
    ]),
  )

  const stationMap = new Map<string, Map<string, StationBreakdownItem>>()
  for (const row of getSection(PERSONNEL_RECAP_SECTIONS.station)) {
    const subUnit = row.Key1
    const station = row.Key2
    const metric = row.Key3
    const count = parseNumber(row.Value)

    const offices = stationMap.get(subUnit) ?? new Map<string, StationBreakdownItem>()
    const entry = offices.get(station) ?? {
      station,
      pco: 0,
      pnco: 0,
      nup: 0,
      uniformed: 0,
    }

    if (metric === "pco") entry.pco = count
    if (metric === "pnco") entry.pnco = count
    if (metric === "nup") entry.nup = count
    entry.uniformed = entry.pco + entry.pnco

    offices.set(station, entry)
    stationMap.set(subUnit, offices)
  }

  const officeBreakdown: OfficeBreakdownItem[] = OFFICES.map((office) => ({
    subUnit: office.subUnit,
    label: office.label,
    shortLabel: office.shortLabel,
    logo: office.logo,
    count: officeCounts.get(office.subUnit) ?? 0,
    colorClass: office.colorClass,
    stations: sortStationBreakdown(
      [...(stationMap.get(office.subUnit)?.values() ?? [])].filter(
        (item) => item.uniformed + item.nup > 0,
      ),
    ),
  }))

  const ageDistributionByOffice: OfficeAgeDistributionRow[] = OFFICES.map((office) => {
    const brackets = createEmptyAgeBrackets()
    const ageRows = getSection(PERSONNEL_RECAP_SECTIONS.age).filter(
      (row) => row.Key1 === office.subUnit,
    )

    for (const row of ageRows) {
      const bracketId = row.Key2
      if (bracketId) {
        brackets[bracketId] = parseNumber(row.Value)
      }
    }

    const total = Object.values(brackets).reduce((sum, count) => sum + count, 0)

    return {
      subUnit: office.subUnit,
      label: office.label,
      brackets,
      total,
    }
  })

  const rankTenureDistribution: RankTenureDistributionRow[] = PNCO_RANK_ORDER.map((rank) => {
    const brackets = createEmptyRankTenureBrackets()
    const tenureRows = getSection(PERSONNEL_RECAP_SECTIONS.rankTenure).filter(
      (row) => row.Key1 === rank,
    )

    for (const row of tenureRows) {
      const bracketId = row.Key2
      if (bracketId) {
        brackets[bracketId] = parseNumber(row.Value)
      }
    }

    const bracketDetails: Partial<Record<string, RankTenurePersonDetail[]>> = {}
    const personRows = getSection(PERSONNEL_RECAP_SECTIONS.rankTenurePerson).filter(
      (row) => row.Key1 === rank,
    )

    for (const row of personRows) {
      const person = decodePersonDetail(row.Value, row.Key3, rank)
      if (!person) continue

      const list = bracketDetails[row.Key2] ?? []
      list.push(person)
      bracketDetails[row.Key2] = list
    }

    for (const bracketId of Object.keys(bracketDetails)) {
      bracketDetails[bracketId]?.sort((a, b) => {
        if (b.yearsInRank !== a.yearsInRank) return b.yearsInRank - a.yearsInRank
        return a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      })
    }

    return {
      rank,
      brackets,
      bracketDetails,
      total: Object.values(brackets).reduce((sum, count) => sum + count, 0),
    }
  })

  const leadershipGroups: LeadershipGroups = {
    regionalCommandGroup: [],
    rStaff: [],
    provincialDirectors: [],
  }

  for (const row of getSection(PERSONNEL_RECAP_SECTIONS.leadership)) {
    const member = decodeLeadership(row.Value, row.Key2, row.Key3)

    if (row.Key1 === "regional_command") {
      leadershipGroups.regionalCommandGroup.push(member)
    } else if (row.Key1 === "r_staff") {
      leadershipGroups.rStaff.push(member)
    } else if (row.Key1 === "provincial_directors") {
      leadershipGroups.provincialDirectors.push(member)
    }
  }

  const unitCountRows = getSection(PERSONNEL_RECAP_SECTIONS.unitCount)
  const unitActiveRows = getSection(PERSONNEL_RECAP_SECTIONS.unitActive)
  const unitRows: UnitRow[] = unitCountRows.map((row) => {
    const active = parseNumber(
      unitActiveRows.find((activeRow) => activeRow.Key1 === row.Key1)?.Value ?? "0",
    )
    const count = parseNumber(row.Value)

    return {
      unit: row.Key1,
      label: row.Key2 || row.Key1,
      count,
      percentage:
        totalRecords > 0 ? Math.round((count / totalRecords) * 1000) / 10 : 0,
      active: active || officeActive.get(row.Key1) || 0,
    }
  })

  if (totalRecords === 0) return null

  return {
    lastUpdated: generatedAt,
    kpis: [
      {
        id: "total",
        label: "Total Personnel",
        value: totalRecords.toLocaleString(),
        detail: "PRO CALABARZON roster",
      },
    ],
    workforce: {
      uniformed: {
        total: workforceValue("uniformed"),
        pco: workforceValue("pco"),
        pnco: workforceValue("pnco"),
      },
      nup: workforceValue("nup"),
      gender: genderStats,
    },
    officeBreakdown,
    rankDistribution,
    ageDistributionByOffice,
    rankTenureDistribution,
    genderStats,
    statusStats,
    unitRows,
    leadership: leadershipGroups,
  }
}
