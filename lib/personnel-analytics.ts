import { fetchSheetCsv, parseCsv } from "@/lib/google-sheets"
import type {
  CountItem,
  KpiMetric,
  LeadershipRow,
  OfficeBreakdownItem,
  PersonnelAnalytics,
  PersonnelRecord,
  RankChartPoint,
  UnitRow,
} from "@/lib/personnel-types"

const OFFICE_CONFIG: {
  subUnit: string
  label: string
  colorClass: string
}[] = [
  { subUnit: "REGIONAL HEADQUARTERS", label: "RHQ", colorClass: "bg-blue-500" },
  { subUnit: "CAVITE POLICE PROVINCIAL OFFICE", label: "Cavite PPO", colorClass: "bg-emerald-500" },
  { subUnit: "LAGUNA POLICE PROVINCIAL OFFICE", label: "Laguna PPO", colorClass: "bg-violet-500" },
  { subUnit: "BATANGAS POLICE PROVINCIAL OFFICE", label: "Batangas PPO", colorClass: "bg-amber-500" },
  { subUnit: "RIZAL POLICE PROVINCIAL OFFICE", label: "Rizal PPO", colorClass: "bg-rose-500" },
  { subUnit: "QUEZON POLICE PROVINCIAL OFFICE", label: "Quezon PPO", colorClass: "bg-cyan-500" },
  { subUnit: "REGIONAL MOBILE FORCE BATTALION", label: "RMFB4A", colorClass: "bg-orange-500" },
]

const LEADERSHIP_RANKS = new Set(["PBGEN", "PCOL", "PLTCOL"])

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

  return OFFICE_CONFIG.map((office) => ({
    subUnit: office.subUnit,
    label: office.label,
    count: counts.get(office.subUnit) ?? 0,
    colorClass: office.colorClass,
  }))
}

function buildKpis(records: PersonnelRecord[]): KpiMetric[] {
  const total = records.length
  const active = records.filter((r) =>
    r.pStatus.toUpperCase().includes("ON DUTY") || r.pStatus.toUpperCase() === "ACTIVE",
  ).length
  const female = records.filter((r) => r.gender.toLowerCase() === "female").length

  return [
    {
      id: "total",
      label: "Total Personnel",
      value: total.toLocaleString(),
      detail: "PRO CALABARZON roster",
    },
    {
      id: "active",
      label: "On Duty / Active",
      value: active.toLocaleString(),
      detail: `${total > 0 ? ((active / total) * 100).toFixed(1) : 0}% of total force`,
    },
    {
      id: "female",
      label: "Female Personnel",
      value: female.toLocaleString(),
      detail: `${total > 0 ? ((female / total) * 100).toFixed(1) : 0}% representation`,
    },
  ]
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

  return [...grouped.entries()]
    .map(([unit, members]) => {
      const active = members.filter((r) =>
        r.pStatus.toUpperCase().includes("ON DUTY") || r.pStatus.toUpperCase() === "ACTIVE",
      ).length

      return {
        unit,
        count: members.length,
        percentage: total > 0 ? Math.round((members.length / total) * 1000) / 10 : 0,
        active,
      }
    })
    .sort((a, b) => b.count - a.count)
}

function buildLeadership(records: PersonnelRecord[]): LeadershipRow[] {
  const rankWeight: Record<string, number> = {
    PBGEN: 1,
    PCOL: 2,
    PLTCOL: 3,
    PMAJ: 4,
    PCPT: 5,
    PLT: 6,
  }

  return records
    .filter((r) => LEADERSHIP_RANKS.has(r.rank))
    .sort((a, b) => {
      const rankDiff = (rankWeight[a.rank] ?? 99) - (rankWeight[b.rank] ?? 99)
      if (rankDiff !== 0) return rankDiff
      return a.lastName.localeCompare(b.lastName)
    })
    .slice(0, 25)
    .map((r, index) => ({
      id: `${r.badgeNumber || index}`,
      rank: r.rank,
      name: [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ").replace(/\s+/g, " "),
      designation: r.designation,
      subUnit: r.subUnit || r.unit,
      status: r.pStatus,
    }))
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
    officeBreakdown: buildOfficeBreakdown(records),
    rankChart,
    genderStats,
    statusStats,
    unitRows: buildUnitRows(records),
    leadership: buildLeadership(records),
  }
}
