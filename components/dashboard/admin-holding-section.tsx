import { ShieldAlert } from "lucide-react"

import { AdminHoldingStatusBreakdown } from "@/components/dashboard/admin-holding-status-breakdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AdminHoldingSummary } from "@/lib/admin-holding-types"

type AdminHoldingSectionProps = {
  data: AdminHoldingSummary
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
              Personnel under admin holding from uploaded RPHAS workbook
            </p>
          </CardContent>
        </Card>

        {data.statusStats.length > 0 ? (
          <AdminHoldingStatusBreakdown items={data.statusStats} />
        ) : null}
      </div>

      {!data.dataReady ? (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang admin holding data pa. Mag-upload ng RPHAS workbook (Admin Holding sheet) sa
            Upload File.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
