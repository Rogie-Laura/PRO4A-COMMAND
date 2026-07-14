import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ridDataCellClass,
  ridDataHeaderClass,
  ridStickyLabelCellClass,
  ridStickyLabelHeaderClass,
  ridStickyLabelTotalCellClass,
  ridTableClass,
  ridTableWrapperClass,
} from "@/components/dashboard/rid-table-styles"
import type { ForeignNationalAnalytics } from "@/lib/foreign-national-types"
import { cn } from "@/lib/utils"
import { RidCardUploadedAt } from "@/components/dashboard/rid-section-header"

type ForeignNationalTableProps = {
  analytics: ForeignNationalAnalytics
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

export function ForeignNationalTable({ analytics }: ForeignNationalTableProps) {
  if (!analytics.dataReady || analytics.rows.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Incident Report Involving Foreign National</CardTitle>
          <CardDescription>
            Walang foreign national incident data pa. Mag-upload ng Incident Report Involving Foreign
            National.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const bodyRows = analytics.rows.filter((row) => !row.isSubTotal)
  const subTotalRow = analytics.rows.find((row) => row.isSubTotal)

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-card">
      <CardHeader>
        <CardTitle>{analytics.title}</CardTitle>
        <CardDescription className="space-y-2">
          <RidCardUploadedAt uploadedAt={analytics.lastUpdated} dataReady={analytics.dataReady} />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-semibold tabular-nums">
              Grand Total: {formatCount(analytics.grandTotal)}
            </Badge>
            {analytics.note ? (
              <Badge variant="outline" className="font-normal">
                {analytics.note}
              </Badge>
            ) : null}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={ridTableWrapperClass}>
          <table className={ridTableClass}>
            <thead>
              <tr className="border-b bg-muted text-center text-muted-foreground">
                <th className={ridStickyLabelHeaderClass("align-middle")}>PPO</th>
                {analytics.months.map((month, index) => (
                  <th
                    key={month}
                    className={ridDataHeaderClass(cn(index === 0 && "border-l"))}
                  >
                    {month}
                  </th>
                ))}
                <th className={ridDataHeaderClass("border-l font-semibold")}>Total</th>
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row) => (
                <tr key={row.ppo} className="border-b last:border-0">
                  <td className={ridStickyLabelCellClass()}>{row.ppo}</td>
                  {analytics.months.map((month, index) => (
                    <td
                      key={`${row.ppo}-${month}`}
                      className={ridDataCellClass(cn(index === 0 && "border-l"))}
                    >
                      {formatCount(row.months[month])}
                    </td>
                  ))}
                  <td className={ridDataCellClass("border-l font-semibold")}>
                    {formatCount(row.rowTotal)}
                  </td>
                </tr>
              ))}
              {subTotalRow ? (
                <tr className="bg-muted/20 font-semibold">
                  <td className={ridStickyLabelTotalCellClass()}>{subTotalRow.ppo}</td>
                  {analytics.months.map((month, index) => (
                    <td
                      key={`subtotal-${month}`}
                      className={ridDataCellClass(cn(index === 0 && "border-l"))}
                    >
                      {formatCount(subTotalRow.months[month])}
                    </td>
                  ))}
                  <td className={ridDataCellClass("border-l")}>
                    {formatCount(subTotalRow.rowTotal)}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
