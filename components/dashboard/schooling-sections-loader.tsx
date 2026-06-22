import { SchoolingSections } from "@/components/dashboard/schooling-sections"
import { Card, CardContent } from "@/components/ui/card"
import {
  getSchoolingMandatorySummary,
  getSchoolingSpecializedSummary,
} from "@/lib/schooling-analytics"

export async function SchoolingSectionsLoader() {
  let mandatory
  let specialized
  try {
    // Sequential fetches — Google throttles concurrent CSV exports from one origin.
    mandatory = await getSchoolingMandatorySummary()
    specialized = await getSchoolingSpecializedSummary()
  } catch {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardContent className="py-5 text-sm text-muted-foreground">
          Hindi ma-load ang Schooling data ngayon. Pindutin ang Refresh data o subukan muli.
        </CardContent>
      </Card>
    )
  }

  return <SchoolingSections mandatory={mandatory} specialized={specialized} />
}
