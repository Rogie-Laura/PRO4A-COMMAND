"use client"

import { useState } from "react"
import { Pill } from "lucide-react"

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
import type { IllegalDrugsPpoRow, IllegalDrugsSheetSummary } from "@/lib/illegal-drugs-types"
import { cn } from "@/lib/utils"

type IllegalDrugsSheetCardProps = {
  summary: IllegalDrugsSheetSummary
  accentClass: string
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

function CountBreakdownTable({ rows }: { rows: IllegalDrugsPpoRow[] }) {
  const bodyRows = rows.filter((row) => !row.isTotal)
  const totalRow = rows.find((row) => row.isTotal)

  return (
    <div className="max-h-[min(60vh,28rem)] overflow-y-auto rounded-lg border bg-muted/10">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="sticky top-0 bg-background/95 backdrop-blur">
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">PPO / Unit</th>
            <th className="px-4 py-3 font-medium text-right">Arrested</th>
            <th className="px-4 py-3 font-medium text-right">Surrendered</th>
            <th className="px-4 py-3 font-medium text-right">DPO</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row) => (
            <tr key={row.ppo} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{row.ppo}</td>
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
              <td className="px-4 py-3">{totalRow.ppo}</td>
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

export function IllegalDrugsSheetCard({ summary, accentClass }: IllegalDrugsSheetCardProps) {
  const [open, setOpen] = useState(false)
  const totalRow = summary.rows.find((row) => row.isTotal)
  const bodyRows = summary.rows.filter((row) => !row.isTotal)
  const label = summary.sheetKey === "hvi" ? "HVI" : "SLI"

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block h-full w-full text-left">
        <Card
          className={cn(
            "h-full border-border/60 bg-gradient-to-br via-card to-card transition hover:shadow-md",
            accentClass,
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="size-5" />
              {label}
            </CardTitle>
            <CardDescription className="space-y-1">
              <span className="block">{summary.title}</span>
              {summary.periodLabel ? <span className="block">{summary.periodLabel}</span> : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalRow ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-background/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Arrested</p>
                  <p className="text-xl font-bold tabular-nums">{formatCount(totalRow.arrested)}</p>
                </div>
                <div className="rounded-lg border bg-background/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Surrendered</p>
                  <p className="text-xl font-bold tabular-nums">
                    {formatCount(totalRow.surrendered)}
                  </p>
                </div>
                <div className="rounded-lg border bg-background/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">DPO</p>
                  <p className="text-xl font-bold tabular-nums">{formatCount(totalRow.dpo)}</p>
                </div>
                <div className="rounded-lg border bg-background/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold tabular-nums">{formatCount(totalRow.total)}</p>
                </div>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">
              {bodyRows.length} PPO/Unit{bodyRows.length === 1 ? "" : "s"}. I-click para makita ang
              breakdown.
            </p>

            <div className="flex flex-wrap gap-2">
              {summary.note ? (
                <Badge variant="outline" className="font-normal">
                  {summary.note}
                </Badge>
              ) : null}
              {summary.breakdownAsOf ? (
                <Badge variant="outline" className="font-normal">
                  {summary.breakdownAsOf}
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {summary.title}
              {summary.periodLabel ? ` · ${summary.periodLabel}` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <CountBreakdownTable rows={summary.rows} />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
