import { ShieldAlert } from "lucide-react"

import { BreakdownCard } from "@/components/dashboard/breakdown-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AdminHoldingAnalytics } from "@/lib/admin-holding-types"

type AdminHoldingSectionProps = {
  data: AdminHoldingAnalytics
}

function formatName(record: AdminHoldingAnalytics["records"][number]) {
  return [record.lastName, `${record.firstName} ${record.middleName}`.trim()]
    .filter(Boolean)
    .join(", ")
}

export function AdminHoldingSection({ data }: AdminHoldingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="gap-0 overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-5" aria-hidden />
              <CardDescription className="font-medium text-amber-700/90 dark:text-amber-300/90">
                Admin Holding
              </CardDescription>
            </div>
            <CardTitle className="text-4xl font-bold tabular-nums text-amber-700 dark:text-amber-300 sm:text-5xl">
              {data.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">Total Admin Holdings</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Personnel under admin holding from RPHAS Data
            </p>
          </CardContent>
        </Card>

        {data.statusStats.length > 0 ? (
          <BreakdownCard
            title="Admin Holding by Status"
            description="Breakdown of current admin holding status"
            items={data.statusStats}
          />
        ) : null}
      </div>

      {!data.dataReady ? (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang admin holding data pa. Siguraduhing naka-public ang RPHAS Data sheet at
            may records sa Admin Holding tab.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Admin Holding Roster</CardTitle>
            <CardDescription>
              {data.total.toLocaleString()} personnel from {data.dataSource}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-3 font-medium">No.</th>
                    <th className="pb-3 pr-3 font-medium">Rank</th>
                    <th className="pb-3 pr-3 font-medium">Name</th>
                    <th className="pb-3 pr-3 font-medium">Former Unit</th>
                    <th className="pb-3 pr-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record) => (
                    <tr key={record.no} className="border-b last:border-0">
                      <td className="py-3 pr-3 tabular-nums">{record.no}</td>
                      <td className="py-3 pr-3 font-medium">{record.rank}</td>
                      <td className="py-3 pr-3">{formatName(record)}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{record.formerUnit}</td>
                      <td className="py-3 pr-3">{record.status}</td>
                      <td className="py-3 text-muted-foreground">{record.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
