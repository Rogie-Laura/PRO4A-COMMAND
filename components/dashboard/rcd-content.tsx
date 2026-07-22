"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatRcdRetirementDate } from "@/lib/rcd-xlsx-parser"
import type { RcdAnalytics, RcdRetireeRecord } from "@/lib/rcd-types"
import { cn } from "@/lib/utils"

type RcdContentProps = {
  data: RcdAnalytics
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  )
}

export function RcdContent({ data }: RcdContentProps) {
  const years = data.years
  const [selectedYear, setSelectedYear] = useState<number | "all">(
    years[0]?.year ?? "all",
  )
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<RcdRetireeRecord | null>(null)

  const retirees = useMemo(() => {
    const source =
      selectedYear === "all"
        ? years.flatMap((year) => year.retirees)
        : (years.find((year) => year.year === selectedYear)?.retirees ?? [])

    const needle = query.trim().toLowerCase()
    if (!needle) return source

    return source.filter((retiree) => {
      const haystack = [
        retiree.name,
        retiree.unit,
        retiree.calClaim,
        retiree.lumpSumClaim,
        retiree.remarks,
        retiree.notes,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [years, selectedYear, query])

  if (!data.dataReady) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-sm text-muted-foreground">
          Wala pang compulsory retirees data. Gamitin ang RCD focal token at mag-upload ng
          workbook sa Upload File.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compulsory Retirees</h1>
          <p className="text-sm text-muted-foreground">
            RCD monitoring of compulsory retirees and claim requirements
            {data.asOf ? ` · As of ${data.asOf}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Retirees</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {data.totalRetirees.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Claims</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-emerald-600 dark:text-emerald-400">
              {data.completedCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With Lacking Requirements</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-amber-600 dark:text-amber-400">
              {data.lackingCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Retiree List</CardTitle>
              <CardDescription>Click a name to view full claim details</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, unit, remarks…"
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedYear("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedYear === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted",
              )}
            >
              All years ({data.totalRetirees})
            </button>
            {years.map((year) => (
              <button
                key={year.year}
                type="button"
                onClick={() => setSelectedYear(year.year)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedYear === year.year
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted",
                )}
              >
                {year.year} ({year.total})
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {retirees.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Walang tumugmang retiree.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Unit</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">
                      Date of Retirement
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retirees.map((retiree) => (
                    <tr
                      key={retiree.id}
                      className="cursor-pointer border-t transition-colors hover:bg-muted/40"
                      onClick={() => setSelected(retiree)}
                    >
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {retiree.number ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">{retiree.name}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {retiree.unit || "—"}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {formatRcdRetirementDate(retiree.retirementDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={retiree.isComplete ? "secondary" : "outline"}>
                          {retiree.isComplete ? "Completed" : "Lacking"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  Compulsory retiree details · CY {selected.year}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <dl>
                  <DetailRow label="Unit" value={selected.unit} />
                  <DetailRow
                    label="Date of Retirement"
                    value={formatRcdRetirementDate(selected.retirementDate)}
                  />
                  <DetailRow label="CAL Claim" value={selected.calClaim} />
                  <DetailRow label="Lump Sum Claim" value={selected.lumpSumClaim} />
                  <DetailRow label="Remarks" value={selected.remarks} />
                  <DetailRow label="Additional Notes" value={selected.notes} />
                </dl>
              </DialogBody>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
