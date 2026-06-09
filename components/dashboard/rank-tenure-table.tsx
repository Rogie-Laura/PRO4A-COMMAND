import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  RANK_TENURE_ABOVE_10_ID,
  RANK_TENURE_ABOVE_10_LABEL,
  RANK_TENURE_BRACKETS,
} from "@/lib/rank-tenure-config"
import type { RankTenureDistributionRow } from "@/lib/personnel-types"

type RankTenureTableProps = {
  rows: RankTenureDistributionRow[]
}

const TABLE_COLUMNS = [
  ...RANK_TENURE_BRACKETS.map((bracket) => ({ id: bracket.id, label: bracket.label })),
  { id: RANK_TENURE_ABOVE_10_ID, label: RANK_TENURE_ABOVE_10_LABEL },
]

export function RankTenureTable({ rows }: RankTenureTableProps) {
  const visibleRows = rows.filter((row) => row.total > 0)
  const columnTotals = TABLE_COLUMNS.map((column) =>
    visibleRows.reduce((sum, row) => sum + (row.brackets[column.id] ?? 0), 0),
  )
  const grandTotal = visibleRows.reduce((sum, row) => sum + row.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Years in Present Rank</CardTitle>
        <CardDescription>
          Headcount per rank by tenure since last promotion (1-5, 6-9 yrs, 10 Above)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Rank</th>
                {TABLE_COLUMNS.map((column) => (
                  <th key={column.id} className="pb-3 px-3 text-center font-medium">
                    {column.label}
                  </th>
                ))}
                <th className="pb-3 pl-3 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.rank} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-xs font-medium sm:text-sm">{row.rank}</td>
                  {TABLE_COLUMNS.map((column) => (
                    <td
                      key={column.id}
                      className="px-3 py-3 text-center tabular-nums text-muted-foreground"
                    >
                      {(row.brackets[column.id] ?? 0).toLocaleString()}
                    </td>
                  ))}
                  <td className="py-3 pl-3 text-center font-semibold tabular-nums text-primary">
                    {row.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 font-semibold">
                <td className="py-3 pr-4 text-sm">Total</td>
                {TABLE_COLUMNS.map((column, index) => (
                  <td key={column.id} className="px-3 py-3 text-center tabular-nums">
                    {columnTotals[index].toLocaleString()}
                  </td>
                ))}
                <td className="py-3 pl-3 text-center tabular-nums text-primary">
                  {grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
