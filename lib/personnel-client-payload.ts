import type { OfficeBreakdownItem, RankTenureDistributionRow } from "@/lib/personnel-types"

export type OfficeBreakdownCard = Omit<OfficeBreakdownItem, "stations">

export type RankTenureTableRow = Omit<RankTenureDistributionRow, "bracketDetails">

export function toOfficeBreakdownCards(offices: OfficeBreakdownItem[]): OfficeBreakdownCard[] {
  return offices.map(({ stations: _stations, ...office }) => office)
}

export function toRankTenureTableRows(
  rows: RankTenureDistributionRow[],
): RankTenureTableRow[] {
  return rows.map(({ bracketDetails: _bracketDetails, ...row }) => row)
}
