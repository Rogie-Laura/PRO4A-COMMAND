"use client"

import { useState } from "react"

import { BmiPersonnelSheet } from "@/components/dashboard/bmi-personnel-sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BMI_CATEGORY_GLASS, isBmiDrilldownCategory, type BmiCategoryId } from "@/lib/bmi-config"
import type { BmiCategoryCount, BmiPersonnelDetail } from "@/lib/health-types"
import { cn } from "@/lib/utils"

type BmiCategoryCardsProps = {
  categories: BmiCategoryCount[]
  totalAssessed: number
  personnelByCategory: Partial<Record<BmiCategoryId, BmiPersonnelDetail[]>>
}

type SelectedCategory = {
  id: BmiCategoryId
  label: string
  personnel: BmiPersonnelDetail[]
}

export function BmiCategoryCards({
  categories,
  totalAssessed,
  personnelByCategory,
}: BmiCategoryCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null)
  const [open, setOpen] = useState(false)

  function handleCategoryClick(category: BmiCategoryCount) {
    if (!isBmiDrilldownCategory(category.id) || category.count === 0) return

    const personnel = personnelByCategory[category.id] ?? []
    if (personnel.length === 0) return

    setSelectedCategory({
      id: category.id,
      label: category.label,
      personnel,
    })
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedCategory(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="gap-0 overflow-hidden border-primary/30 bg-primary/15 shadow-sm backdrop-blur-md sm:max-w-xs dark:border-primary/25 dark:bg-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-primary/90">
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
          {categories.map((category) => {
            const isDrilldown =
              isBmiDrilldownCategory(category.id) && category.count > 0

            const card = (
              <Card
                className={cn(
                  "gap-0 overflow-hidden",
                  BMI_CATEGORY_GLASS[category.id],
                  isDrilldown &&
                    "cursor-pointer transition-colors hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <CardHeader className="pb-2">
                  <CardDescription className="font-medium">{category.label}</CardDescription>
                  <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
                    {category.count.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {totalAssessed > 0
                      ? `${category.percentage}% of assessed`
                      : "No data yet"}
                    {isDrilldown ? " · Tap to view list" : ""}
                  </p>
                </CardContent>
              </Card>
            )

            if (!isDrilldown) {
              return <div key={category.id}>{card}</div>
            }

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="text-left"
              >
                {card}
              </button>
            )
          })}
        </div>
      </div>

      <BmiPersonnelSheet
        categoryLabel={selectedCategory?.label ?? null}
        personnel={selectedCategory?.personnel ?? []}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
