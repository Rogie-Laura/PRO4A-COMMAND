import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionPlaceholderProps = {
  title: string
}

export function SectionPlaceholder({ title }: SectionPlaceholderProps) {
  return (
    <DashboardLayout title={title}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>This section is coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Data and analytics for {title.toLowerCase()} will be available here.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
