import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SurrenderedCtgfAnalytics, SurrenderedCtgfCountSet } from "@/lib/surrendered-ctgf-types"
import { cn } from "@/lib/utils"

type SurrenderedCtgfTableProps = {
  analytics: SurrenderedCtgfAnalytics
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

function CountCells({
  counts,
  emphasize = false,
  sectionStart = false,
}: {
  counts: SurrenderedCtgfCountSet
  emphasize?: boolean
  sectionStart?: boolean
}) {
  return (
    <>
      <td
        className={cn(
          "px-3 py-3 text-right tabular-nums",
          sectionStart && "border-l",
          emphasize && "font-semibold",
        )}
      >
        {formatCount(counts.psr)}
      </td>
      <td className={cn("px-3 py-3 text-right tabular-nums", emphasize && "font-semibold")}>
        {formatCount(counts.npsr)}
      </td>
      <td className={cn("px-3 py-3 text-right tabular-nums", emphasize && "font-semibold")}>
        {formatCount(counts.total)}
      </td>
    </>
  )
}

export function SurrenderedCtgfTable({ analytics }: SurrenderedCtgfTableProps) {
  if (!analytics.dataReady || analytics.rows.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Surrendered CTGs and FAs</CardTitle>
          <CardDescription>
            Walang surrendered CTGs data pa. Mag-upload ng SURRENDERED CTGs AND FAs.xlsx sa Upload
            File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const bodyRows = analytics.rows.filter((row) => !row.isTotal)
  const totalRow = analytics.rows.find((row) => row.isTotal)

  return (
    <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-card to-card">
      <CardHeader>
        <CardTitle>{analytics.title}</CardTitle>
        <CardDescription className="space-y-2">
          {analytics.periodLabel ? <span className="block">{analytics.periodLabel}</span> : null}
          <div className="flex flex-wrap gap-2">
            {analytics.note ? (
              <Badge variant="outline" className="font-normal">
                {analytics.note}
              </Badge>
            ) : null}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border bg-background/70">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-center text-muted-foreground">
                <th rowSpan={2} className="px-4 py-3 text-left font-medium align-middle">
                  Province / Unit
                </th>
                <th colSpan={3} className="border-l px-3 py-2 font-medium">
                  Arrested
                </th>
                <th colSpan={3} className="border-l px-3 py-2 font-medium">
                  Died
                </th>
                <th colSpan={3} className="border-l px-3 py-2 font-medium">
                  Surrendered
                </th>
                <th colSpan={3} className="border-l px-3 py-2 font-medium">
                  Grand Total
                </th>
              </tr>
              <tr className="border-b bg-muted/20 text-center text-xs text-muted-foreground">
                <th className="border-l px-3 py-2 font-medium">PSR</th>
                <th className="px-3 py-2 font-medium">NPSR</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="border-l px-3 py-2 font-medium">PSR</th>
                <th className="px-3 py-2 font-medium">NPSR</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="border-l px-3 py-2 font-medium">PSR</th>
                <th className="px-3 py-2 font-medium">NPSR</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="border-l px-3 py-2 font-medium">PSR</th>
                <th className="px-3 py-2 font-medium">NPSR</th>
                <th className="px-3 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row) => (
                <tr key={row.province} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.province}</td>
                  <CountCells counts={row.arrested} sectionStart />
                  <CountCells counts={row.died} sectionStart />
                  <CountCells counts={row.surrendered} sectionStart />
                  <CountCells counts={row.grandTotal} sectionStart emphasize />
                </tr>
              ))}
              {totalRow ? (
                <tr className="bg-muted/20 font-semibold">
                  <td className="px-4 py-3">{totalRow.province}</td>
                  <CountCells counts={totalRow.arrested} sectionStart emphasize />
                  <CountCells counts={totalRow.died} sectionStart emphasize />
                  <CountCells counts={totalRow.surrendered} sectionStart emphasize />
                  <CountCells counts={totalRow.grandTotal} sectionStart emphasize />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
