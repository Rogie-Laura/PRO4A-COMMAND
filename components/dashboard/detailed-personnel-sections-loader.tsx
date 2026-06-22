import { DetailedPersonnelSections } from "@/components/dashboard/detailed-personnel-sections"
import { Card, CardContent } from "@/components/ui/card"
import {
  getDetailedNhqAnalytics,
  getDetailedNosusAnalytics,
  getDetailedRhqPpoAnalytics,
  getDetailedRsuAnalytics,
  toDetailedPersonnelSummary,
} from "@/lib/detailed-personnel-analytics"
import { buildDetailedPersonnelStatusCounts } from "@/lib/detailed-personnel-status"

export async function DetailedPersonnelSectionsLoader() {
  let nhq
  let nosus
  let rsu
  let rhqPpo
  try {
    ;[nhq, nosus, rsu, rhqPpo] = await Promise.all([
      getDetailedNhqAnalytics(),
      getDetailedNosusAnalytics(),
      getDetailedRsuAnalytics(),
      getDetailedRhqPpoAnalytics(),
    ])
  } catch {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardContent className="py-5 text-sm text-muted-foreground">
          Hindi ma-load ang Detailed Personnel data ngayon. Pindutin ang Refresh data o subukan muli.
        </CardContent>
      </Card>
    )
  }

  return (
    <DetailedPersonnelSections
      nhq={toDetailedPersonnelSummary(nhq)}
      nosus={toDetailedPersonnelSummary(nosus)}
      rsu={toDetailedPersonnelSummary(rsu)}
      rhqPpo={toDetailedPersonnelSummary(rhqPpo)}
      status={buildDetailedPersonnelStatusCounts(nhq, nosus, rsu, rhqPpo)}
    />
  )
}
