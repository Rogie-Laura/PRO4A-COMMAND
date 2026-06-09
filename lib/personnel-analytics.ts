import { fetchSheetCsv, parseCsv } from "@/lib/google-sheets"
import { KEY_LEADERSHIP_SLOTS } from "@/lib/leadership-config"
import { OFFICES } from "@/lib/office-config"
import { isNup, isPco, isPnco } from "@/lib/rank-config"
import type {
  CountItem,
  KpiMetric,
  LeadershipRow,
  OfficeBreakdownItem,
  PersonnelAnalytics,
  PersonnelRecord,
  RankChartPoint,
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

function buildOfficeBreakdown(records: PersonnelRecord[]): OfficeBreakdownItem[] {
  const counts = countBy(records, (r) => r.subUnit)

  return OFFICES.map((office) => ({
    subUnit: office.subUnit,
    label: office.label,
    shortLabel: office.shortLabel,
    logo: office.logo,
    count: counts.get(office.subUnit) ?? 0,
    colorClass: office.colorClass,
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

function buildRankChart(records: PersonnelRecord[]): RankChartPoint[] {
  const rankOrder = [
    "Pat",
    "PCpl",
    "PSSg",
    "PMSg",
    "PSMS",
    "PCMS",
    "PEMS",
    "PLT",
    "PCPT",
    "PMAJ",
    "PLTCOL",
    "PCOL",
    "PBGEN",
    "NUP",
  ]

  const counts = countBy(records, (r) => r.rank)

  return rankOrder
    .filter((rank) => counts.has(rank))
    .map((rank) => ({ rank, count: counts.get(rank) ?? 0 }))
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

function buildLeadership(records: PersonnelRecord[]): LeadershipRow[] {
  const rhqRecords = records.filter((r) => r.subUnit === "REGIONAL HEADQUARTERS")

  return KEY_LEADERSHIP_SLOTS.flatMap((slot) => {
    const person = rhqRecords.find((r) => slot.match(r.designation))
    if (!person) return []

    return [
      {
        id: person.badgeNumber || slot.id,
        rank: person.rank,
        name: formatLeadershipName(person),
        designation: person.designation,
      },
    ]
  })
}

export async function getPersonnelAnalytics(): Promise<PersonnelAnalytics> {
  const csv = await fetchSheetCsv()
  const rows = parseCsv(csv)
  const records = rows.map(mapRow).filter((r) => r.lastName || r.firstName)
  const total = records.length

  const statusStats = toCountItems(countBy(records, (r) => r.pStatus), total).slice(0, 6)
  const genderStats = toCountItems(countBy(records, (r) => r.gender), total)
  const rankChart = buildRankChart(records)

  return {
    lastUpdated: new Date().toISOString(),
    kpis: buildKpis(records),
    workforce: buildWorkforceSummary(records),
    officeBreakdown: buildOfficeBreakdown(records),
    rankChart,
    genderStats,
    statusStats,
    unitRows: buildUnitRows(records),
    leadership: buildLeadership(records),
  }
}
