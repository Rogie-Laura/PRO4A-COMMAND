import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OfficePlaceholderPageProps = {
  title: string
}

export function OfficePlaceholderPage({ title }: OfficePlaceholderPageProps) {
  return (
    <Card className="max-w-xl border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Module content for this office is not yet available in PRO4A COMMAND.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Check back later or contact the system administrator for updates.
        </p>
      </CardContent>
    </Card>
  )
}
