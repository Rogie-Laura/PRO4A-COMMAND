import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { UnitRow } from "@/lib/personnel-types"

type UnitTableProps = {
  rows: UnitRow[]
}

export function UnitTable({ rows }: UnitTableProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Personnel by Unit</CardTitle>
        <CardDescription>Headcount per provincial and regional office</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Unit</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Active</th>
                <th className="pb-3 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.unit} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-xs sm:text-sm">{row.unit}</td>
                  <td className="py-3 pr-4 tabular-nums">{row.count.toLocaleString()}</td>
                  <td className="py-3 pr-4 tabular-nums">{row.active.toLocaleString()}</td>
                  <td className="py-3 tabular-nums">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
