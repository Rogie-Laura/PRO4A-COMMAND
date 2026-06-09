import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { topPages } from "@/lib/analytics-data"

export function TopPages() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>Most visited pages in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Page</th>
                <th className="pb-3 pr-4 font-medium">Views</th>
                <th className="pb-3 pr-4 font-medium">Bounce Rate</th>
                <th className="pb-3 font-medium">Avg. Time</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page) => (
                <tr key={page.path} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs sm:text-sm">{page.path}</td>
                  <td className="py-3 pr-4 tabular-nums">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{page.bounceRate}%</td>
                  <td className="py-3 tabular-nums">{page.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
