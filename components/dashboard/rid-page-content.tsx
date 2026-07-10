import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function RidPageContent() {
  return (
    <div className="space-y-4">
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>RID</CardTitle>
          <CardDescription>
            Ang Terrorism Threat Level ay nasa PRO4A Status na. Mag-upload pa rin ng
            TERRORISM THREAT LEVEL.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/pro4a-status"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Pumunta sa PRO4A Status
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
