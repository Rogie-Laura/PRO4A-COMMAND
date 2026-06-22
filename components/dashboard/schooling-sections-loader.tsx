import { SchoolingSections } from "@/components/dashboard/schooling-sections"
import { Card, CardContent } from "@/components/ui/card"
import {
  getSchoolingMandatoryAnalytics,
  getSchoolingSpecializedAnalytics,
  toSchoolingSummary,
} from "@/lib/schooling-analytics"

export async function SchoolingSectionsLoader() {
  try {
    const [mandatory, specialized] = await Promise.all([
      getSchoolingMandatoryAnalytics(),
      getSchoolingSpecializedAnalytics(),
    ])

    return (
      <SchoolingSections
        mandatory={toSchoolingSummary(mandatory)}
        specialized={toSchoolingSummary(specialized)}
      />
    )
  } catch {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardContent className="py-5 text-sm text-muted-foreground">
          Hindi ma-load ang Schooling data ngayon. Pindutin ang Refresh data o subukan muli.
        </CardContent>
      </Card>
    )
  }
}
