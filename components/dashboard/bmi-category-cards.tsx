import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { BmiCategoryCount } from "@/lib/health-types"

type BmiCategoryCardsProps = {
  categories: BmiCategoryCount[]
  totalAssessed: number
}

export function BmiCategoryCards({ categories, totalAssessed }: BmiCategoryCardsProps) {
  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card sm:max-w-xs">
        <CardHeader className="pb-2">
          <CardDescription className="font-medium text-primary/80">
            Personnel Assessed
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">
            {totalAssessed.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">With recorded BMI classification</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id} className="gap-0">
            <CardHeader className="pb-2">
              <CardDescription>{category.label}</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
                {category.count.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {totalAssessed > 0 ? `${category.percentage}% of assessed` : "No data yet"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
