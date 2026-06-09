import { AGE_BRACKETS, getAgeBracketFromBirthDate } from "@/lib/age-config"
import { fetchSheetCsv, parseCsv } from "@/lib/google-sheets"
import {
  type LeadershipSlot,
  PROVINCIAL_DIRECTOR_SLOTS,
  R_STAFF_SLOTS,
  REGIONAL_COMMAND_GROUP_SLOTS,
} from "@/lib/leadership-config"
import { OFFICES } from "@/lib/office-config"
import { isNup, isPco, isPnco, PCO_RANK_ORDER, PNCO_RANK_ORDER } from "@/lib/rank-config"
import { formatStationLabel } from "@/lib/station-labels"
import { sortStationBreakdown } from "@/lib/station-sort"
import type {
  CountItem,
  KpiMetric,
  LeadershipGroups,
  LeadershipRow,
  OfficeAgeDistributionRow,
  OfficeBreakdownItem,
  PersonnelAnalytics,
  PersonnelRecord,
  RankChartPoint,
  RankDistribution,
  StationBreakdownItem,
  UnitRow,
  WorkforceSummary,
} from "@/lib/personnel-types"

function mapRow(row: Record<string, string>): PersonnelRecord {
  return {
    rank: row.Rank ?? "",
    lastName: row["Last Name"] ?? "",
    firstName: row["First Name"] ?? "",
    middleName: row["Middle Name"] ?? "",
    badgeNumber: row["Badge Number"] ?? "",
    birthDate: row.BirthDate ?? "",
    designation: row.Designation ?? "",
    pStatus: row.PStatus ?? "",
    gender: row.Gender ?? "",
    civilStatus: row["Civil Status"] ?? "",
    unit: row.Unit ?? "",
    subUnit: row["Sub Unit"] ?? "",
    station: row.Station ?? "",
  }
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>()

  for (const item of items) {
    const key = keyFn(item).trim() || "Unknown"
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return counts
}

function toCountItems(counts: Map<string, number>, total: number): CountItem[] {
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function buildStationBreakdown(
  records: PersonnelRecord[],
  subUnit: string,
): StationBreakdownItem[] {
  const officeRecords = records.filter((r) => r.subUnit === subUnit)
  const grouped = new Map<string, { pco: number; pnco: number; nup: number }>()

  for (const record of officeRecords) {
    const station = record.station.trim() || "Unassigned"
    const entry = grouped.get(station) ?? { pco: 0, pnco: 0, nup: 0 }

    if (isPco(record.rank)) {
      entry.pco += 1
    } else if (isPnco(record.rank)) {
      entry.pnco += 1
    } else if (isNup(record.rank)) {
      entry.nup += 1
    }

    grouped.set(station, entry)
  }

  return sortStationBreakdown(
    [...grouped.entries()]
      .map(([rawStation, counts]) => ({
        station: formatStationLabel(rawStation),
        pco: counts.pco,
        pnco: counts.pnco,
        nup: counts.nup,
        uniformed: counts.pco + counts.pnco,
      }))
      .filter((item) => item.uniformed + item.nup > 0),
  )
}

function buildOfficeBreakdown(records: PersonnelRecord[]): OfficeBreakdownItem[] {
  const counts = countBy(records, (r) => r.subUnit)

  return OFFICES.map((office) => ({
    subUnit: office.subUnit,
    label: office.label,
    shortLabel: office.shortLabel,
    logo: office.logo,
    count: counts.get(office.subUnit) ?? 0,
    colorClass: office.colorClass,
    stations: buildStationBreakdown(records, office.subUnit),
  }))
}

function buildKpis(records: PersonnelRecord[]): KpiMetric[] {
  return [
    {
      id: "total",
      label: "Total Personnel",
      value: records.length.toLocaleString(),
      detail: "PRO CALABARZON roster",
    },
  ]
}

function buildWorkforceSummary(records: PersonnelRecord[]): WorkforceSummary {
  const total = records.length
  const pco = records.filter((r) => isPco(r.rank)).length
  const pnco = records.filter((r) => isPnco(r.rank)).length
  const nup = records.filter((r) => isNup(r.rank)).length
  const uniformed = records.filter((r) => !isNup(r.rank)).length

  return {
    uniformed: { total: uniformed, pco, pnco },
    nup,
    gender: toCountItems(countBy(records, (r) => r.gender), total),
  }
}

function buildRankSlice(
  records: PersonnelRecord[],
  rankOrder: readonly string[],
  matcher: (rank: string) => boolean,
): RankChartPoint[] {
  const counts = countBy(
    records.filter((record) => matcher(record.rank)),
    (record) => record.rank,
  )

  return rankOrder
    .filter((rank) => counts.has(rank))
    .map((rank) => ({ rank, count: counts.get(rank) ?? 0 }))
}

function buildRankDistribution(records: PersonnelRecord[]): RankDistribution {
  return {
    pco: buildRankSlice(records, PCO_RANK_ORDER, isPco),
    pnco: buildRankSlice(records, PNCO_RANK_ORDER, isPnco),
  }
}

function createEmptyAgeBrackets() {
  return Object.fromEntries(AGE_BRACKETS.map((bracket) => [bracket.id, 0]))
}

function buildAgeDistributionByOffice(records: PersonnelRecord[]): OfficeAgeDistributionRow[] {
  return OFFICES.map((office) => {
    const brackets = createEmptyAgeBrackets()
    const officeRecords = records.filter((record) => record.subUnit === office.subUnit)

    for (const record of officeRecords) {
      const bracketId = getAgeBracketFromBirthDate(record.birthDate)
      if (!bracketId) continue
      brackets[bracketId] += 1
    }

    const total = AGE_BRACKETS.reduce((sum, bracket) => sum + brackets[bracket.id], 0)

    return {
      subUnit: office.subUnit,
      label: office.label,
      brackets,
      total,
    }
  })
}

function buildUnitRows(records: PersonnelRecord[]): UnitRow[] {
  const total = records.length
  const grouped = new Map<string, PersonnelRecord[]>()

  for (const record of records) {
    const unit = record.subUnit || record.unit || "Unknown"
    const list = grouped.get(unit) ?? []
    list.push(record)
    grouped.set(unit, list)
  }

  const knownUnits = OFFICES.map((office) => {
    const members = grouped.get(office.subUnit) ?? []
    const active = members.filter((r) =>
      r.pStatus.toUpperCase().includes("ON DUTY") || r.pStatus.toUpperCase() === "ACTIVE",
    ).length

    return {
      unit: office.subUnit,
      label: office.label,
      count: members.length,
      percentage: total > 0 ? Math.round((members.length / total) * 1000) / 10 : 0,
      active,
    }
  })

  const otherUnits = [...grouped.entries()]
    .filter(([unit]) => !OFFICES.some((office) => office.subUnit === unit))
    .map(([unit, members]) => {
      const active = members.filter((r) =>
        r.pStatus.toUpperCase().includes("ON DUTY") || r.pStatus.toUpperCase() === "ACTIVE",
      ).length

      return {
        unit,
        label: unit,
        count: members.length,
        percentage: total > 0 ? Math.round((members.length / total) * 1000) / 10 : 0,
        active,
      }
    })
    .sort((a, b) => b.count - a.count)

  return [...knownUnits, ...otherUnits]
}

function formatLeadershipName(record: PersonnelRecord) {
  const middle = record.middleName ? ` ${record.middleName.charAt(0)}.` : ""
  return `${record.lastName}, ${record.firstName}${middle}`
}

function buildLeadershipSlotRows(
  records: PersonnelRecord[],
  slots: LeadershipSlot[],
): LeadershipRow[] {
  return slots.map((slot) => {
    const pool = slot.subUnit
      ? records.filter((record) => record.subUnit === slot.subUnit)
      : records.filter((record) => record.subUnit === "REGIONAL HEADQUARTERS")

    const person = pool.find((record) => slot.match(record.designation))

    if (!person) {
      return {
        id: slot.id,
        rank: "",
        name: "Vacant",
        designation: slot.label,
        vacant: true,
      }
    }

    return {
      id: person.badgeNumber || slot.id,
      rank: person.rank,
      name: formatLeadershipName(person),
      designation: slot.label,
      vacant: false,
    }
  })
}

function buildLeadership(records: PersonnelRecord[]): LeadershipGroups {
  return {
    regionalCommandGroup: buildLeadershipSlotRows(records, REGIONAL_COMMAND_GROUP_SLOTS),
    rStaff: buildLeadershipSlotRows(records, R_STAFF_SLOTS),
    provincialDirectors: buildLeadershipSlotRows(records, PROVINCIAL_DIRECTOR_SLOTS),
  }
}

export async function getPersonnelAnalytics(): Promise<PersonnelAnalytics> {
  const csv = await fetchSheetCsv()
  const rows = parseCsv(csv)
  const records = rows.map(mapRow).filter((r) => r.lastName || r.firstName)
  const total = records.length

  const statusStats = toCountItems(countBy(records, (r) => r.pStatus), total).slice(0, 6)
  const genderStats = toCountItems(countBy(records, (r) => r.gender), total)
  const rankDistribution = buildRankDistribution(records)
  const ageDistributionByOffice = buildAgeDistributionByOffice(records)

  return {
    lastUpdated: new Date().toISOString(),
    kpis: buildKpis(records),
    workforce: buildWorkforceSummary(records),
    officeBreakdown: buildOfficeBreakdown(records),
    rankDistribution,
    ageDistributionByOffice,
    genderStats,
    statusStats,
    unitRows: buildUnitRows(records),
    leadership: buildLeadership(records),
  }
}
