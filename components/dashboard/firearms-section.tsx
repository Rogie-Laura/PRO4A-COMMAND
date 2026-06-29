import { FirearmsCategorySection } from "@/components/dashboard/firearms-category-section"
import { Card, CardContent } from "@/components/ui/card"
import type { FirearmsAnalytics } from "@/lib/firearms-types"

type FirearmsSectionProps = {
  data: FirearmsAnalytics
}

export function FirearmsSection({ data }: FirearmsSectionProps) {
  return (
    <div className="space-y-6">
      {!data.dataReady ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Walang firearms data pa. I-upload ang `firearms.xlsx` sa Settings (Short Firearms at
            Long Firearms worksheets).
          </CardContent>
        </Card>
      ) : null}

      <FirearmsCategorySection category={data.shortFirearms} dataReady={data.dataReady} />
      <FirearmsCategorySection category={data.longFirearms} dataReady={data.dataReady} />
    </div>
  )
}
