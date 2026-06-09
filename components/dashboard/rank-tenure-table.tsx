"use client"

import { useState } from "react"

import { RankTenureDetailSheet } from "@/components/dashboard/rank-tenure-detail-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  RANK_TENURE_TABLE_COLUMNS,
  isRankTenureDrilldownBracket,
} from "@/lib/rank-tenure-config"
import type { RankTenureDistributionRow, RankTenurePersonDetail } from "@/lib/personnel-types"
import { cn } from "@/lib/utils"

type RankTenureTableProps = {
  rows: RankTenureDistributionRow[]
}

type SelectedCell = {
  rank: string
  bracketId: string
  bracketLabel: string
  personnel: RankTenurePersonDetail[]
}

export function RankTenureTable({ rows }: RankTenureTableProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [open, setOpen] = useState(false)

  const visibleRows = rows.filter((row) => row.total > 0)
  const columnTotals = RANK_TENURE_TABLE_COLUMNS.map((column) =>
    visibleRows.reduce((sum, row) => sum + (row.brackets[column.id] ?? 0), 0),
  )
  const grandTotal = visibleRows.reduce((sum, row) => sum + row.total, 0)

  function handleCellClick(
    row: RankTenureDistributionRow,
    bracketId: string,
    bracketLabel: string,
    count: number,
  ) {
    if (!isRankTenureDrilldownBracket(bracketId) || count === 0) return

    const personnel = row.bracketDetails[bracketId] ?? []
    if (personnel.length === 0) return

    setSelectedCell({
      rank: row.rank,
      bracketId,
      bracketLabel,
      personnel,
    })
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedCell(null)
    }
  }

  function renderCountCell(
    row: RankTenureDistributionRow,
    column: (typeof RANK_TENURE_TABLE_COLUMNS)[number],
  ) {
    const count = row.brackets[column.id] ?? 0
    const isDrilldown = isRankTenureDrilldownBracket(column.id) && count > 0

    if (!isDrilldown) {
      return (
        <span className="tabular-nums text-muted-foreground">{count.toLocaleString()}</span>
      )
    }

    return (
      <button
        type="button"
        onClick={() => handleCellClick(row, column.id, column.label, count)}
        className={cn(
          "tabular-nums font-medium text-primary underline-offset-4 transition-colors",
          "hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {count.toLocaleString()}
      </button>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Years in Present Rank (PNCO)</CardTitle>
          <CardDescription>
            PNCO headcount by tenure since last promotion. Less than 1 yr is strictly under 12
            months; 1-5 yrs starts at the first full year. Click 8 yrs, 9 yrs, or 10 yrs above for
            personnel details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Rank</th>
                  {RANK_TENURE_TABLE_COLUMNS.map((column) => (
                    <th key={column.id} className="pb-3 px-3 text-center font-medium">
                      {column.label}
                    </th>
                  ))}
                  <th className="pb-3 pl-3 text-center font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.rank} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-xs font-medium sm:text-sm">{row.rank}</td>
                    {RANK_TENURE_TABLE_COLUMNS.map((column) => (
                      <td key={column.id} className="px-3 py-3 text-center">
                        {renderCountCell(row, column)}
                      </td>
                    ))}
                    <td className="py-3 pl-3 text-center font-semibold tabular-nums text-primary">
                      {row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30 font-semibold">
                  <td className="py-3 pr-4 text-sm">Total</td>
                  {RANK_TENURE_TABLE_COLUMNS.map((column, index) => (
                    <td key={column.id} className="px-3 py-3 text-center tabular-nums">
                      {columnTotals[index].toLocaleString()}
                    </td>
                  ))}
                  <td className="py-3 pl-3 text-center tabular-nums text-primary">
                    {grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <RankTenureDetailSheet
        rank={selectedCell?.rank ?? null}
        bracketLabel={selectedCell?.bracketLabel ?? null}
        personnel={selectedCell?.personnel ?? []}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
