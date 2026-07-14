import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ridDataCellClass,
  ridDataHeaderClass,
  ridStickyLabelCellClass,
  ridStickyLabelHeaderClass,
  ridStickyLabelTotalCellClass,
  ridTableClass,
  ridTableWrapperClass,
} from "@/components/dashboard/rid-table-styles"
import type { SurrenderedCtgfAnalytics, SurrenderedCtgfCountSet } from "@/lib/surrendered-ctgf-types"
import { cn } from "@/lib/utils"
import { RidCardUploadedAt } from "@/components/dashboard/rid-section-header"

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
      <td className={ridDataCellClass(cn(sectionStart && "border-l", emphasize && "font-semibold"))}>
        {formatCount(counts.psr)}
      </td>
      <td className={ridDataCellClass(emphasize ? "font-semibold" : undefined)}>
        {formatCount(counts.npsr)}
      </td>
      <td className={ridDataCellClass(emphasize ? "font-semibold" : undefined)}>
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
          <RidCardUploadedAt uploadedAt={analytics.lastUpdated} dataReady={analytics.dataReady} />
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
        <div className={ridTableWrapperClass}>
          <table className={ridTableClass}>
            <thead>
              <tr className="border-b bg-muted text-center text-muted-foreground">
                <th rowSpan={2} className={ridStickyLabelHeaderClass("align-middle")}>
                  Province / Unit
                </th>
                <th colSpan={3} className={ridDataHeaderClass("border-l")}>
                  Arrested
                </th>
                <th colSpan={3} className={ridDataHeaderClass("border-l")}>
                  Died
                </th>
                <th colSpan={3} className={ridDataHeaderClass("border-l")}>
                  Surrendered
                </th>
                <th colSpan={3} className={ridDataHeaderClass("border-l")}>
                  Grand Total
                </th>
              </tr>
              <tr className="border-b bg-muted text-center text-muted-foreground">
                <th className={ridDataHeaderClass("border-l")}>PSR</th>
                <th className={ridDataHeaderClass()}>NPSR</th>
                <th className={ridDataHeaderClass()}>Total</th>
                <th className={ridDataHeaderClass("border-l")}>PSR</th>
                <th className={ridDataHeaderClass()}>NPSR</th>
                <th className={ridDataHeaderClass()}>Total</th>
                <th className={ridDataHeaderClass("border-l")}>PSR</th>
                <th className={ridDataHeaderClass()}>NPSR</th>
                <th className={ridDataHeaderClass()}>Total</th>
                <th className={ridDataHeaderClass("border-l")}>PSR</th>
                <th className={ridDataHeaderClass()}>NPSR</th>
                <th className={ridDataHeaderClass()}>Total</th>
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row) => (
                <tr key={row.province} className="border-b last:border-0">
                  <td className={ridStickyLabelCellClass()}>{row.province}</td>
                  <CountCells counts={row.arrested} sectionStart />
                  <CountCells counts={row.died} sectionStart />
                  <CountCells counts={row.surrendered} sectionStart />
                  <CountCells counts={row.grandTotal} sectionStart emphasize />
                </tr>
              ))}
              {totalRow ? (
                <tr className="bg-muted/20 font-semibold">
                  <td className={ridStickyLabelTotalCellClass()}>{totalRow.province}</td>
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
