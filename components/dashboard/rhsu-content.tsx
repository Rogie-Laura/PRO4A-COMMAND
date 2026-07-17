import {
  BadgeCheck,
  CarFront,
  CircleParking,
  Clock3,
  ShieldAlert,
  UsersRound,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRhsuAnalytics } from "@/lib/rhsu-records"

function StatisticCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: number
  detail?: string
  icon: typeof CarFront
}) {
  return (
    <Card className="gap-3 overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div className="space-y-1">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {value.toLocaleString()}
          </CardTitle>
        </div>
        <div className="rounded-xl bg-primary/12 p-2.5 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
      </CardHeader>
      {detail ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}

export async function RhsuContent() {
  const data = await getRhsuAnalytics()
  const maxMonthly = Math.max(1, ...data.decalsByMonth.map((item) => item.total))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RHSU Statistics</h1>
          <p className="text-sm text-muted-foreground">
            Decal applications, release status, and personnel under restrictive custody
          </p>
        </div>
        {data.asOf ? (
          <div className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            As of {data.asOf}
          </div>
        ) : null}
      </div>

      {!data.dataReady ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Wala pang RHSU data. Gamitin ang RHSU focal token at mag-upload ng decals at PURCs
            workbook sa Upload File.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatisticCard
              label="Total Decals Applied"
              value={data.decalsTotals.total}
              detail={`${data.decalsTotals.passcards.toLocaleString()} passcards · ${data.decalsTotals.stickers.toLocaleString()} stickers`}
              icon={BadgeCheck}
            />
            <StatisticCard
              label="Claimed / Released"
              value={data.decalStatus.claimedReleased}
              detail={`of ${data.decalStatus.applied.toLocaleString()} applied`}
              icon={CircleParking}
            />
            <StatisticCard
              label="Unclaimed Decals"
              value={data.decalStatus.unclaimed}
              icon={ShieldAlert}
            />
            <StatisticCard
              label="Personnel Under Restrictive Custody"
              value={data.purcsTotal}
              detail="Total reported PURCs"
              icon={UsersRound}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Decal Applications</CardTitle>
                <CardDescription>
                  Four-wheeled passcards and two-wheeled stickers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.decalsByMonth.map((item) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{item.month}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {item.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-primary"
                        style={{ width: `${Math.max(2, (item.total / maxMonthly) * 100)}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        <CarFront className="mr-1 inline size-3" aria-hidden />
                        {item.passcards.toLocaleString()} passcards
                      </span>
                      <span>
                        <CircleParking className="mr-1 inline size-3" aria-hidden />
                        {item.stickers.toLocaleString()} stickers
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly PURCs</CardTitle>
                <CardDescription>
                  RHQ personnel under restrictive custody
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Month</th>
                        <th className="px-4 py-3 text-right font-medium">No. of PURCs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.purcsByMonth.map((item) => (
                        <tr key={item.month} className="border-t">
                          <td className="px-4 py-3">{item.month}</td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">
                            {item.count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30 font-semibold">
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {data.purcsTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
