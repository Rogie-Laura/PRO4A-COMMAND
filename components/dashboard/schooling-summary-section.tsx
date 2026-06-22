import { GraduationCap } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SchoolingSummary } from "@/lib/schooling-types"

type SchoolingSummarySectionProps = {
  mandatory: SchoolingSummary
  specialized: SchoolingSummary
}

export function SchoolingSummarySection({
  mandatory,
  specialized,
}: SchoolingSummarySectionProps) {
  const total = mandatory.total + specialized.total
  const dataReady = mandatory.dataReady || specialized.dataReady

  return (
    <Card className="gap-0 overflow-hidden border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 via-indigo-500/8 to-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <GraduationCap className="size-5" aria-hidden />
          <CardDescription className="font-medium text-indigo-700/90 dark:text-indigo-300/90">
            Personnel Under Schooling
          </CardDescription>
        </div>
        <CardTitle className="text-4xl font-bold tabular-nums text-indigo-700 dark:text-indigo-300 sm:text-5xl">
          {total.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Total personnel currently on mandatory and specialized schooling
        </p>
        <div className="flex flex-wrap gap-2">
          <SummaryChip label="Mandatory" count={mandatory.total} />
          <SummaryChip label="Specialized" count={specialized.total} />
        </div>
        {!dataReady ? (
          <p className="text-sm text-muted-foreground">
            Walang schooling data pa. I-refresh pag na-update na ang Personnel sheet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SummaryChip({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-full border border-indigo-500/20 bg-background/70 px-3 py-1 text-sm">
      <span className="font-medium">{label}</span>
      <span className="ml-2 tabular-nums text-muted-foreground">{count.toLocaleString()}</span>
    </div>
  )
}
