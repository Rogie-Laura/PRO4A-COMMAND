"use client"

import { useState, useTransition } from "react"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"

import { fetchBmiMovementPersonnelAction } from "@/app/(dashboard)/health-and-bmi/actions"
import { BmiMovementSheet } from "@/components/dashboard/bmi-movement-sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  BmiMovementBucket,
  BmiMovementPerson,
  BmiTrackingSummary,
} from "@/lib/health-types"
import { cn } from "@/lib/utils"

type BmiTrackingCardsProps = {
  tracking: BmiTrackingSummary
}

type StatCard = {
  bucket: BmiMovementBucket
  label: string
  value: number
  hint: string
  icon: typeof TrendingUpIcon
  glass: string
}

function formatSignedKg(value: number) {
  const rounded = Math.round(value * 10) / 10
  const sign = rounded > 0 ? "+" : ""
  return `${sign}${rounded.toLocaleString()} kg`
}

export function BmiTrackingCards({ tracking }: BmiTrackingCardsProps) {
  const [open, setOpen] = useState(false)
  const [sheetTitle, setSheetTitle] = useState<string | null>(null)
  const [sheetDescription, setSheetDescription] = useState<string | undefined>(undefined)
  const [personnel, setPersonnel] = useState<BmiMovementPerson[]>([])
  const [isPending, startTransition] = useTransition()

  if (!tracking.available) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weight &amp; BMI Tracking (month-over-month)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Only one month is stored so far. Upload a second month (e.g. May 2026) in Settings using
          the same <span className="font-medium">With BMI List</span> format so this section can
          automatically show who gained or lost weight and how BMI categories moved.
        </CardContent>
      </Card>
    )
  }

  function openBucket(bucket: BmiMovementBucket, title: string, description?: string) {
    if (isPending) return
    setSheetTitle(title)
    setSheetDescription(description)
    setPersonnel([])
    setOpen(true)
    startTransition(async () => {
      try {
        const list = await fetchBmiMovementPersonnelAction(bucket)
        setPersonnel(list)
      } catch {
        setPersonnel([])
      }
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSheetTitle(null)
      setSheetDescription(undefined)
      setPersonnel([])
    }
  }

  const weightCards: StatCard[] = [
    {
      bucket: "gained",
      label: "Gained Weight",
      value: tracking.weight.gained,
      hint: `Heavier by more than 0.5 kg vs ${tracking.previousMonthLabel}`,
      icon: TrendingUpIcon,
      glass: "border-rose-400/35 bg-rose-500/15 dark:border-rose-400/25 dark:bg-rose-500/10",
    },
    {
      bucket: "lost",
      label: "Lost Weight",
      value: tracking.weight.lost,
      hint: `Lighter by more than 0.5 kg vs ${tracking.previousMonthLabel}`,
      icon: TrendingDownIcon,
      glass:
        "border-emerald-400/35 bg-emerald-500/15 dark:border-emerald-400/25 dark:bg-emerald-500/10",
    },
    {
      bucket: "maintained",
      label: "Maintained",
      value: tracking.weight.maintained,
      hint: "Within ±0.5 kg (about the same)",
      icon: MinusIcon,
      glass: "border-slate-400/35 bg-slate-500/15 dark:border-slate-400/25 dark:bg-slate-500/10",
    },
  ]

  const categoryCards: StatCard[] = [
    {
      bucket: "improved",
      label: "Improved Category",
      value: tracking.category.improved,
      hint: "Moved to a leaner BMI class (e.g. Obese → Overweight)",
      icon: ArrowDownRightIcon,
      glass:
        "border-emerald-400/35 bg-emerald-500/15 dark:border-emerald-400/25 dark:bg-emerald-500/10",
    },
    {
      bucket: "worsened",
      label: "Worsened Category",
      value: tracking.category.worsened,
      hint: "Moved to a heavier BMI class (e.g. Overweight → Obese)",
      icon: ArrowUpRightIcon,
      glass: "border-rose-400/35 bg-rose-500/15 dark:border-rose-400/25 dark:bg-rose-500/10",
    },
    {
      bucket: "unchanged",
      label: "Same Category",
      value: tracking.category.unchanged,
      hint: "Stayed in the same BMI class",
      icon: MinusIcon,
      glass: "border-slate-400/35 bg-slate-500/15 dark:border-slate-400/25 dark:bg-slate-500/10",
    },
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Weight &amp; BMI Tracking</h2>
            <p className="text-sm text-muted-foreground">
              Comparison: {tracking.previousMonthLabel} → {tracking.currentMonthLabel}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {tracking.matchedCount.toLocaleString()} personnel matched across both months
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Weight</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {weightCards.map((card) => (
              <StatCardButton
                key={card.bucket}
                card={card}
                disabled={isPending || card.value === 0}
                onClick={() => openBucket(card.bucket, card.label, card.hint)}
              />
            ))}
          </div>
          {tracking.weight.avgDeltaKg != null ? (
            <p className="text-xs text-muted-foreground">
              Average weight change:{" "}
              <span className="font-medium tabular-nums">
                {formatSignedKg(tracking.weight.avgDeltaKg)}
              </span>{" "}
              per person · net total:{" "}
              <span className="font-medium tabular-nums">
                {formatSignedKg(tracking.weight.netDeltaKg)}
              </span>{" "}
              ({tracking.weight.withWeightData.toLocaleString()} with weight in both months)
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">BMI Category Movement</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {categoryCards.map((card) => (
              <StatCardButton
                key={card.bucket}
                card={card}
                disabled={isPending || card.value === 0}
                onClick={() => openBucket(card.bucket, card.label, card.hint)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {tracking.category.withCategoryData.toLocaleString()} personnel with a BMI class
            in both months.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Coverage</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCardButton
              card={{
                bucket: "notUpdated",
                label: "No Updated BMI",
                value: tracking.onlyPreviousCount,
                hint: `Recorded in ${tracking.previousMonthLabel} but missing in ${tracking.currentMonthLabel}${
                  tracking.onlyPreviousCount > 0 ? " · tap to view" : ""
                }`,
                icon: UserXIcon,
                glass:
                  "border-amber-400/35 bg-amber-500/15 dark:border-amber-400/25 dark:bg-amber-500/10",
              }}
              disabled={isPending || tracking.onlyPreviousCount === 0}
              onClick={() =>
                openBucket(
                  "notUpdated",
                  `No Updated BMI (${tracking.currentMonthLabel})`,
                  `In ${tracking.previousMonthLabel}, not in ${tracking.currentMonthLabel}`,
                )
              }
            />
            <StatCardButton
              card={{
                bucket: "newlyRecorded",
                label: "Newly Recorded",
                value: tracking.onlyCurrentCount,
                hint: `New assessment in ${tracking.currentMonthLabel}, not in ${tracking.previousMonthLabel}${
                  tracking.onlyCurrentCount > 0 ? " · tap to view" : ""
                }`,
                icon: UserCheckIcon,
                glass:
                  "border-sky-400/35 bg-sky-500/15 dark:border-sky-400/25 dark:bg-sky-500/10",
              }}
              disabled={isPending || tracking.onlyCurrentCount === 0}
              onClick={() =>
                openBucket(
                  "newlyRecorded",
                  `Newly Recorded (${tracking.currentMonthLabel})`,
                  `In ${tracking.currentMonthLabel}, not in ${tracking.previousMonthLabel}`,
                )
              }
            />
          </div>
        </div>
      </div>

      <BmiMovementSheet
        title={sheetTitle}
        description={sheetDescription}
        personnel={personnel}
        isLoading={open && isPending}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}

function StatCardButton({
  card,
  disabled,
  onClick,
}: {
  card: StatCard
  disabled: boolean
  onClick: () => void
}) {
  const Icon = card.icon
  const inner = (
    <Card
      className={cn(
        "gap-0 overflow-hidden shadow-sm backdrop-blur-md",
        card.glass,
        !disabled &&
          "transition-colors hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 font-medium">
          <Icon className="size-4" />
          {card.label}
        </CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
          {card.value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{card.hint}</p>
      </CardContent>
    </Card>
  )

  if (disabled) {
    return <div>{inner}</div>
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left disabled:cursor-wait">
      {inner}
    </button>
  )
}
