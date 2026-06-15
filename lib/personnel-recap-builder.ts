import { AGE_ABOVE_56_ID, AGE_BRACKETS } from "@/lib/age-config"
import {
  buildAgeDistributionByOffice,
  buildGenderStats,
  buildKpis,
  buildLeadership,
  buildOfficeBreakdown,
  buildRankDistribution,
  buildRankTenureDistribution,
  buildStatusStats,
  buildUnitRows,
  buildWorkforceSummary,
} from "@/lib/personnel-aggregations"
import {
  PERSONNEL_RECAP_HEADERS,
  PERSONNEL_RECAP_SECTIONS,
} from "@/lib/personnel-recap-sheet"
import { RANK_TENURE_BRACKETS, RANK_TENURE_LESS_THAN_1_ID, RANK_TENURE_ABOVE_10_ID } from "@/lib/rank-tenure-config"
import type { PersonnelRecord } from "@/lib/personnel-types"

type RecapRow = [string, string, string, string, string]

function row(section: string, key1 = "", key2 = "", key3 = "", value = ""): RecapRow {
  return [section, key1, key2, key3, value]
}

function encodePersonDetail(person: {
  name: string
  badgeNumber: string
  lastPromotionDate: string
  yearsInRank: number
  office: string
  unit: string
}) {
  return [
    person.name,
    person.badgeNumber,
    person.lastPromotionDate,
    String(person.yearsInRank),
    person.office,
    person.unit,
  ].join("|")
}

export function buildPersonnelRecapRows(records: PersonnelRecord[]): RecapRow[] {
  const rows: RecapRow[] = [PERSONNEL_RECAP_HEADERS.slice() as RecapRow]
  const analytics = {
    kpis: buildKpis(records),
    workforce: buildWorkforceSummary(records),
    officeBreakdown: buildOfficeBreakdown(records),
    rankDistribution: buildRankDistribution(records),
    ageDistributionByOffice: buildAgeDistributionByOffice(records),
    rankTenureDistribution: buildRankTenureDistribution(records),
    genderStats: buildGenderStats(records),
    statusStats: buildStatusStats(records),
    unitRows: buildUnitRows(records),
    leadership: buildLeadership(records),
  }

  rows.push(row(PERSONNEL_RECAP_SECTIONS.meta, "generated_at", "", "", new Date().toISOString()))
  rows.push(row(PERSONNEL_RECAP_SECTIONS.meta, "source", "", "", "personnel-roster"))
  rows.push(row(PERSONNEL_RECAP_SECTIONS.meta, "record_count", "", "", String(records.length)))

  const totalKpi = analytics.kpis.find((item) => item.id === "total")
  rows.push(row(PERSONNEL_RECAP_SECTIONS.kpi, "total", "", "", totalKpi?.value.replace(/,/g, "") ?? "0"))

  rows.push(
    row(PERSONNEL_RECAP_SECTIONS.workforce, "uniformed", "", "", String(analytics.workforce.uniformed.total)),
    row(PERSONNEL_RECAP_SECTIONS.workforce, "pco", "", "", String(analytics.workforce.uniformed.pco)),
    row(PERSONNEL_RECAP_SECTIONS.workforce, "pnco", "", "", String(analytics.workforce.uniformed.pnco)),
    row(PERSONNEL_RECAP_SECTIONS.workforce, "nup", "", "", String(analytics.workforce.nup)),
  )

  for (const item of analytics.workforce.gender) {
    rows.push(row(PERSONNEL_RECAP_SECTIONS.workforceGender, item.name, "", "", String(item.count)))
  }

  for (const item of analytics.statusStats) {
    rows.push(row(PERSONNEL_RECAP_SECTIONS.status, item.name, "", "", String(item.count)))
  }

  for (const item of analytics.rankDistribution.pco) {
    rows.push(row(PERSONNEL_RECAP_SECTIONS.rankPco, item.rank, "", "", String(item.count)))
  }

  for (const item of analytics.rankDistribution.pnco) {
    rows.push(row(PERSONNEL_RECAP_SECTIONS.rankPnco, item.rank, "", "", String(item.count)))
  }

  for (const office of analytics.officeBreakdown) {
    const unitRow = analytics.unitRows.find((item) => item.unit === office.subUnit)
    rows.push(
      row(PERSONNEL_RECAP_SECTIONS.office, office.subUnit, "", "", String(office.count)),
      row(PERSONNEL_RECAP_SECTIONS.officeActive, office.subUnit, "", "", String(unitRow?.active ?? 0)),
    )

    for (const station of office.stations) {
      rows.push(
        row(PERSONNEL_RECAP_SECTIONS.station, office.subUnit, station.station, "pco", String(station.pco)),
        row(PERSONNEL_RECAP_SECTIONS.station, office.subUnit, station.station, "pnco", String(station.pnco)),
        row(PERSONNEL_RECAP_SECTIONS.station, office.subUnit, station.station, "nup", String(station.nup)),
      )
    }
  }

  for (const office of analytics.ageDistributionByOffice) {
    for (const bracket of AGE_BRACKETS) {
      rows.push(
        row(
          PERSONNEL_RECAP_SECTIONS.age,
          office.subUnit,
          bracket.id,
          "",
          String(office.brackets[bracket.id] ?? 0),
        ),
      )
    }
    rows.push(
      row(
        PERSONNEL_RECAP_SECTIONS.age,
        office.subUnit,
        AGE_ABOVE_56_ID,
        "",
        String(office.brackets[AGE_ABOVE_56_ID] ?? 0),
      ),
    )
  }

  for (const rankRow of analytics.rankTenureDistribution) {
    rows.push(row(PERSONNEL_RECAP_SECTIONS.rankTenure, rankRow.rank, RANK_TENURE_LESS_THAN_1_ID, "", String(rankRow.brackets[RANK_TENURE_LESS_THAN_1_ID] ?? 0)))

    for (const bracket of RANK_TENURE_BRACKETS) {
      rows.push(
        row(
          PERSONNEL_RECAP_SECTIONS.rankTenure,
          rankRow.rank,
          bracket.id,
          "",
          String(rankRow.brackets[bracket.id] ?? 0),
        ),
      )
    }

    rows.push(
      row(
        PERSONNEL_RECAP_SECTIONS.rankTenure,
        rankRow.rank,
        RANK_TENURE_ABOVE_10_ID,
        "",
        String(rankRow.brackets[RANK_TENURE_ABOVE_10_ID] ?? 0),
      ),
    )

    for (const [bracketId, people] of Object.entries(rankRow.bracketDetails)) {
      for (const person of people ?? []) {
        rows.push(
          row(
            PERSONNEL_RECAP_SECTIONS.rankTenurePerson,
            rankRow.rank,
            bracketId,
            person.id,
            encodePersonDetail(person),
          ),
        )
      }
    }
  }

  const leadershipGroups = [
    ["regional_command", analytics.leadership.regionalCommandGroup] as const,
    ["r_staff", analytics.leadership.rStaff] as const,
    ["provincial_directors", analytics.leadership.provincialDirectors] as const,
  ]

  for (const [group, members] of leadershipGroups) {
    for (const member of members) {
      rows.push(
        row(
          PERSONNEL_RECAP_SECTIONS.leadership,
          group,
          member.id,
          member.designation,
          [member.rank, member.name, member.vacant ? "1" : "0"].join("|"),
        ),
      )
    }
  }

  for (const unit of analytics.unitRows) {
    rows.push(
      row(PERSONNEL_RECAP_SECTIONS.unitCount, unit.unit, unit.label, "", String(unit.count)),
      row(PERSONNEL_RECAP_SECTIONS.unitActive, unit.unit, "", "", String(unit.active)),
    )
  }

  return rows
}

export function recapRowsToCsv(rows: RecapRow[]) {
  return rows
    .map((entry) =>
      entry
        .map((value) => {
          const text = String(value ?? "")
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
        })
        .join(","),
    )
    .join("\n")
}
