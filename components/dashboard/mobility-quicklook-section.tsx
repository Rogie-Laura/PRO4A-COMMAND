import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { QuicklookSummary } from "@/lib/mobility-types"

type MobilityQuicklookSectionProps = {
  data: QuicklookSummary
}

function AssetSummary({
  title,
  asset,
}: {
  title: string
  asset: QuicklookSummary["landTotals"]
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{asset.total.toLocaleString()}</p>
      <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
        <p>SVC: {asset.serviceable.organic + asset.serviceable.donated + asset.serviceable.loaned}</p>
        <p>UNSVC: {asset.unserviceable.organic + asset.unserviceable.donated + asset.unserviceable.loaned}</p>
        <p>BER: {asset.ber.organic + asset.ber.donated + asset.ber.loaned}</p>
      </div>
    </div>
  )
}

export function MobilityQuicklookSection({ data }: MobilityQuicklookSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Quicklook Summary</CardTitle>
        <CardDescription>
          {data.asOf ? `Land and water assets as of ${data.asOf}` : "Land and water assets by unit"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <AssetSummary title="Land Assets" asset={data.landTotals} />
          <AssetSummary title="Water Assets" asset={data.waterTotals} />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Unit</th>
                <th className="px-3 py-2 font-medium">Land</th>
                <th className="px-3 py-2 font-medium">Water</th>
                <th className="px-3 py-2 font-medium">Combined</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.unitId} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{row.label}</td>
                  <td className="px-3 py-2 tabular-nums">{row.land.total.toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums">{row.water.total.toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums text-primary">{row.combinedTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
