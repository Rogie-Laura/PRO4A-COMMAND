import { DetailedPersonnelSections } from "@/components/dashboard/detailed-personnel-sections"
import { Card, CardContent } from "@/components/ui/card"
import { getDetailedPersonnelDashboard } from "@/lib/detailed-personnel-analytics"

export async function DetailedPersonnelSectionsLoader() {
  let data
  try {
    data = await getDetailedPersonnelDashboard()
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
      nhq={data.nhq}
      nosus={data.nosus}
      rsu={data.rsu}
      rhqPpo={data.rhqPpo}
      status={data.status}
    />
  )
}
