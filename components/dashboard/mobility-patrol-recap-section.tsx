import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PatrolRecapSummary } from "@/lib/mobility-types"

type MobilityPatrolRecapSectionProps = {
  data: PatrolRecapSummary
}

export function MobilityPatrolRecapSection({ data }: MobilityPatrolRecapSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Patrol Vehicle Recap</CardTitle>
        <CardDescription>
          Organic · Donated · Loaned breakdown by vehicle type · Total{" "}
          {data.grandTotal.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Vehicle Type</th>
                <th className="px-3 py-2 font-medium">Organic</th>
                <th className="px-3 py-2 font-medium">Donated</th>
                <th className="px-3 py-2 font-medium">Loaned</th>
                <th className="px-3 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.vehicleType} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{row.vehicleType}</td>
                  <td className="px-3 py-2 tabular-nums">{row.organic.subtotal.toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums">{row.donated.subtotal.toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums">{row.loaned.subtotal.toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums text-primary">{row.grandTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
