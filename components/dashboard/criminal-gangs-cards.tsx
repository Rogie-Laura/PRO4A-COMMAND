"use client"

import { useState, type ReactNode } from "react"
import { Siren, Target, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  CriminalGangsAnalytics,
  CriminalGangsCountRow,
  CriminalGangsGroupSummary,
} from "@/lib/criminal-gangs-types"
import { cn } from "@/lib/utils"

type CriminalGangsCardsProps = {
  analytics: CriminalGangsAnalytics
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

function GroupBreakdownTable({ rows }: { rows: CriminalGangsCountRow[] }) {
  const bodyRows = rows.filter((row) => !row.isTotal)
  const totalRow = rows.find((row) => row.isTotal)

  return (
    <div className="max-h-[min(60vh,28rem)] overflow-y-auto rounded-lg border bg-muted/10">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="sticky top-0 bg-background/95 backdrop-blur">
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Unit</th>
            <th className="px-4 py-3 font-medium text-right">Arrested</th>
            <th className="px-4 py-3 font-medium text-right">Surrendered</th>
            <th className="px-4 py-3 font-medium text-right">DPO</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row) => (
            <tr key={row.unit} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{row.unit}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCount(row.arrested)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCount(row.surrendered)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCount(row.dpo)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold">
                {formatCount(row.total)}
              </td>
            </tr>
          ))}
          {totalRow ? (
            <tr className="bg-muted/20 font-semibold">
              <td className="px-4 py-3">{totalRow.unit}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCount(totalRow.arrested)}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatCount(totalRow.surrendered)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCount(totalRow.dpo)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCount(totalRow.total)}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

type SummaryCardProps = {
  title: string
  total: number
  meta?: string
  icon: ReactNode
  accentClass: string
  onClick: () => void
  stats?: Array<{ label: string; value: number }>
}

function SummaryCard({
  title,
  total,
  meta,
  icon,
  accentClass,
  onClick,
  stats,
}: SummaryCardProps) {
  return (
    <button type="button" onClick={onClick} className="block h-full w-full text-left">
      <Card
        className={cn(
          "h-full border-border/60 bg-gradient-to-br via-card to-card transition hover:shadow-md",
          accentClass,
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-3xl font-bold tabular-nums">{formatCount(total)}</p>
          </div>

          {stats && stats.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-background/70 px-2 py-2">
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold tabular-nums">{formatCount(stat.value)}</p>
                </div>
              ))}
            </div>
          ) : null}

          {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        </CardContent>
      </Card>
    </button>
  )
}

export function CriminalGangsCards({ analytics }: CriminalGangsCardsProps) {
  const [selectedGroup, setSelectedGroup] = useState<CriminalGangsGroupSummary | null>(null)

  if (
    !analytics.dataReady ||
    !analytics.drugGroups ||
    !analytics.gunForHireGroups ||
    !analytics.otherCriminalGroups
  ) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Criminal Gangs</CardTitle>
          <CardDescription>
            Walang criminal gangs data pa. Mag-upload ng ACCOMPLISHMENTS ON CRIMINAL GANGS.xlsx sa
            Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const unitCount = analytics.drugGroups.unitRows.filter((row) => !row.isTotal).length

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{analytics.title}</Badge>
          {analytics.periodLabel ? (
            <Badge variant="outline" className="font-normal">
              {analytics.periodLabel}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Drug Groups"
            total={analytics.drugGroups.total}
            meta={`${unitCount} units. I-click para makita ang breakdown.`}
            icon={<Siren className="size-5 text-rose-600 dark:text-rose-400" />}
            accentClass="from-rose-500/10 border-rose-500/20"
            onClick={() => setSelectedGroup(analytics.drugGroups!)}
            stats={[
              { label: "Arrested", value: analytics.drugGroups.arrested },
              { label: "Surrendered", value: analytics.drugGroups.surrendered },
              { label: "DPO", value: analytics.drugGroups.dpo },
            ]}
          />

          <SummaryCard
            title="Gun-for-Hire Groups"
            total={analytics.gunForHireGroups.total}
            meta={`${unitCount} units. I-click para makita ang breakdown.`}
            icon={<Target className="size-5 text-orange-600 dark:text-orange-400" />}
            accentClass="from-orange-500/10 border-orange-500/20"
            onClick={() => setSelectedGroup(analytics.gunForHireGroups!)}
            stats={[
              { label: "Arrested", value: analytics.gunForHireGroups.arrested },
              { label: "Surrendered", value: analytics.gunForHireGroups.surrendered },
              { label: "DPO", value: analytics.gunForHireGroups.dpo },
            ]}
          />

          <SummaryCard
            title="Other Criminal Groups"
            total={analytics.otherCriminalGroups.total}
            meta={`${unitCount} units. I-click para makita ang breakdown.`}
            icon={<Users className="size-5 text-indigo-600 dark:text-indigo-400" />}
            accentClass="from-indigo-500/10 border-indigo-500/20"
            onClick={() => setSelectedGroup(analytics.otherCriminalGroups!)}
            stats={[
              { label: "Arrested", value: analytics.otherCriminalGroups.arrested },
              { label: "Surrendered", value: analytics.otherCriminalGroups.surrendered },
              { label: "DPO", value: analytics.otherCriminalGroups.dpo },
            ]}
          />
        </div>
      </div>

      <Dialog
        open={selectedGroup != null}
        onOpenChange={(open) => {
          if (!open) setSelectedGroup(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.label}</DialogTitle>
            <DialogDescription>
              {formatCount(selectedGroup?.total ?? 0)} total · breakdown by unit
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedGroup ? <GroupBreakdownTable rows={selectedGroup.unitRows} /> : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
