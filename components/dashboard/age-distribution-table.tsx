import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AGE_ABOVE_56_ID, AGE_ABOVE_56_LABEL, AGE_BRACKETS } from "@/lib/age-config"
import type { OfficeAgeDistributionRow } from "@/lib/personnel-types"

type AgeDistributionTableProps = {
  rows: OfficeAgeDistributionRow[]
}

const TABLE_COLUMNS = [
  ...AGE_BRACKETS.map((bracket) => ({ id: bracket.id, label: bracket.label })),
  { id: AGE_ABOVE_56_ID, label: AGE_ABOVE_56_LABEL },
]

export function AgeDistributionTable({ rows }: AgeDistributionTableProps) {
  const columnTotals = TABLE_COLUMNS.map((column) =>
    rows.reduce((sum, row) => sum + (row.brackets[column.id] ?? 0), 0),
  )
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution of Personnel by Age</CardTitle>
        <CardDescription>
          Headcount per office across age brackets (20-30, 31-39, 40-50, 51-55, 56 Above)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Office</th>
                {TABLE_COLUMNS.map((column) => (
                  <th key={column.id} className="pb-3 px-3 text-center font-medium">
                    {column.label}
                  </th>
                ))}
                <th className="pb-3 pl-3 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.subUnit} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-xs font-medium sm:text-sm">{row.label}</td>
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
