import { ArrowRightLeft } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DetailedPersonnelAnalytics } from "@/lib/detailed-personnel-types"

type DetailedPersonnelSummarySectionProps = {
  nhq: DetailedPersonnelAnalytics
  nosus: DetailedPersonnelAnalytics
  rsu: DetailedPersonnelAnalytics
  rhqPpo: DetailedPersonnelAnalytics
}

export function DetailedPersonnelSummarySection({
  nhq,
  nosus,
  rsu,
  rhqPpo,
}: DetailedPersonnelSummarySectionProps) {
  const total = nhq.total + nosus.total + rsu.total + rhqPpo.total
  const dataReady = nhq.dataReady || nosus.dataReady || rsu.dataReady || rhqPpo.dataReady

  return (
    <Card className="gap-0 overflow-hidden border-rose-500/30 bg-gradient-to-br from-rose-500/20 via-rose-500/8 to-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
          <ArrowRightLeft className="size-5" aria-hidden />
          <CardDescription className="font-medium text-rose-700/90 dark:text-rose-300/90">
            Personnel on Detail Assignment
          </CardDescription>
        </div>
        <CardTitle className="text-4xl font-bold tabular-nums text-rose-700 dark:text-rose-300 sm:text-5xl">
          {total.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Combined total across NHQ, NOSUs, RSU, and RHQ &amp; PPO detail tabs
        </p>
        <div className="flex flex-wrap gap-2">
          <SummaryChip label="NHQ" count={nhq.total} />
          <SummaryChip label="NOSUs" count={nosus.total} />
          <SummaryChip label="RSU" count={rsu.total} />
          <SummaryChip label="RHQ & PPO" count={rhqPpo.total} />
        </div>
        {!dataReady ? (
          <p className="text-sm text-muted-foreground">
            Walang detailed personnel data pa. I-refresh pag na-update na ang Personnel sheet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SummaryChip({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-full border border-rose-500/20 bg-background/70 px-3 py-1 text-sm">
      <span className="font-medium">{label}</span>
      <span className="ml-2 tabular-nums text-muted-foreground">{count.toLocaleString()}</span>
    </div>
  )
}
