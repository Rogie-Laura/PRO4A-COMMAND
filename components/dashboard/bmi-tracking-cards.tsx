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

import { fetchBmiCoveragePersonnelAction } from "@/app/(dashboard)/health-and-bmi/actions"
import { BmiPersonnelSheet } from "@/components/dashboard/bmi-personnel-sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BmiPersonnelDetail, BmiTrackingSummary } from "@/lib/health-types"
import { cn } from "@/lib/utils"

type BmiTrackingCardsProps = {
  tracking: BmiTrackingSummary
}

type StatCard = {
  key: string
  label: string
  value: number
  hint: string
  icon: typeof TrendingUpIcon
  glass: string
}

type CoverageKind = "not-updated" | "newly-recorded"

function formatSignedKg(value: number) {
  const rounded = Math.round(value * 10) / 10
  const sign = rounded > 0 ? "+" : ""
  return `${sign}${rounded.toLocaleString()} kg`
}

export function BmiTrackingCards({ tracking }: BmiTrackingCardsProps) {
  const [open, setOpen] = useState(false)
  const [sheetLabel, setSheetLabel] = useState<string | null>(null)
  const [personnel, setPersonnel] = useState<BmiPersonnelDetail[]>([])
  const [isPending, startTransition] = useTransition()

  if (!tracking.available) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/15 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weight & BMI tracking (buwan-sa-buwan)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Isang buwan pa lang ang naka-store. Mag-upload ng pangalawang buwan (hal. May 2026) sa
          Settings gamit ang parehong <span className="font-medium">With BMI List</span> na format
          para awtomatikong lumabas dito kung sino ang tumaba, gumaan, at ang paggalaw ng BMI
          category.
        </CardContent>
      </Card>
    )
  }

  function openCoverage(kind: CoverageKind, label: string) {
    if (isPending) return
    setSheetLabel(label)
    setPersonnel([])
    setOpen(true)
    startTransition(async () => {
      try {
        const list = await fetchBmiCoveragePersonnelAction(kind)
        setPersonnel(list)
      } catch {
        setPersonnel([])
      }
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSheetLabel(null)
      setPersonnel([])
    }
  }

  const weightCards: StatCard[] = [
    {
      key: "gained",
      label: "Tumaba",
      value: tracking.weight.gained,
      hint: `Mas mabigat nang higit 0.5 kg vs ${tracking.previousMonthLabel}`,
      icon: TrendingUpIcon,
      glass: "border-rose-400/35 bg-rose-500/15 dark:border-rose-400/25 dark:bg-rose-500/10",
    },
    {
      key: "lost",
      label: "Gumaan",
      value: tracking.weight.lost,
      hint: `Mas magaan nang higit 0.5 kg vs ${tracking.previousMonthLabel}`,
      icon: TrendingDownIcon,
      glass:
        "border-emerald-400/35 bg-emerald-500/15 dark:border-emerald-400/25 dark:bg-emerald-500/10",
    },
    {
      key: "maintained",
      label: "Walang binago",
      value: tracking.weight.maintained,
      hint: "Nasa loob ng ±0.5 kg (halos pareho)",
      icon: MinusIcon,
      glass: "border-slate-400/35 bg-slate-500/15 dark:border-slate-400/25 dark:bg-slate-500/10",
    },
  ]

  const categoryCards: StatCard[] = [
    {
      key: "improved",
      label: "Bumaba ang category",
      value: tracking.category.improved,
      hint: "Napunta sa mas magaang BMI class (hal. Obese → Overweight)",
      icon: ArrowDownRightIcon,
      glass:
        "border-emerald-400/35 bg-emerald-500/15 dark:border-emerald-400/25 dark:bg-emerald-500/10",
    },
    {
      key: "worsened",
      label: "Tumaas ang category",
      value: tracking.category.worsened,
      hint: "Napunta sa mas mabigat na BMI class (hal. Overweight → Obese)",
      icon: ArrowUpRightIcon,
      glass: "border-rose-400/35 bg-rose-500/15 dark:border-rose-400/25 dark:bg-rose-500/10",
    },
    {
      key: "unchanged",
      label: "Pareho ang category",
      value: tracking.category.unchanged,
      hint: "Nanatili sa parehong BMI class",
      icon: MinusIcon,
      glass: "border-slate-400/35 bg-slate-500/15 dark:border-slate-400/25 dark:bg-slate-500/10",
    },
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Weight &amp; BMI tracking</h2>
            <p className="text-sm text-muted-foreground">
              Paghahambing: {tracking.previousMonthLabel} → {tracking.currentMonthLabel}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {tracking.matchedCount.toLocaleString()} personnel ang nagkatugma sa parehong buwan
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Timbang (weight)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {weightCards.map((card) => (
              <StatCardView key={card.key} card={card} />
            ))}
          </div>
          {tracking.weight.avgDeltaKg != null ? (
            <p className="text-xs text-muted-foreground">
              Average na pagbabago ng timbang:{" "}
              <span className="font-medium tabular-nums">
                {formatSignedKg(tracking.weight.avgDeltaKg)}
              </span>{" "}
              kada tao · net na kabuuan:{" "}
              <span className="font-medium tabular-nums">
                {formatSignedKg(tracking.weight.netDeltaKg)}
              </span>{" "}
              ({tracking.weight.withWeightData.toLocaleString()} na may timbang sa dalawang buwan)
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">BMI category movement</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {categoryCards.map((card) => (
              <StatCardView key={card.key} card={card} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Batay sa {tracking.category.withCategoryData.toLocaleString()} personnel na may BMI class
            sa dalawang buwan.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Coverage (assessment)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <CoverageCardButton
              disabled={isPending || tracking.onlyPreviousCount === 0}
              label="Walang updated BMI"
              value={tracking.onlyPreviousCount}
              hint={`May record noong ${tracking.previousMonthLabel} pero wala sa ${tracking.currentMonthLabel}${
                tracking.onlyPreviousCount > 0 ? " · i-tap para makita" : ""
              }`}
              icon={UserXIcon}
              glass="border-amber-400/35 bg-amber-500/15 dark:border-amber-400/25 dark:bg-amber-500/10"
              onClick={() =>
                openCoverage(
                  "not-updated",
                  `Walang updated BMI (${tracking.currentMonthLabel})`,
                )
              }
            />
            <CoverageCardButton
              disabled={isPending || tracking.onlyCurrentCount === 0}
              label="Bagong na-record"
              value={tracking.onlyCurrentCount}
              hint={`Bagong assessment sa ${tracking.currentMonthLabel}, wala noong ${tracking.previousMonthLabel}${
                tracking.onlyCurrentCount > 0 ? " · i-tap para makita" : ""
              }`}
              icon={UserCheckIcon}
              glass="border-sky-400/35 bg-sky-500/15 dark:border-sky-400/25 dark:bg-sky-500/10"
              onClick={() =>
                openCoverage("newly-recorded", `Bagong na-record (${tracking.currentMonthLabel})`)
              }
            />
          </div>
        </div>
      </div>

      <BmiPersonnelSheet
        categoryLabel={sheetLabel}
        personnel={personnel}
        isLoading={open && isPending}
        open={open}
        onOpenChange={handleOpenChange}
        describe={(count) => `${count.toLocaleString()} personnel`}
      />
    </>
  )
}

function StatCardView({ card }: { card: StatCard }) {
  const Icon = card.icon
  return (
    <Card className={cn("gap-0 overflow-hidden backdrop-blur-md shadow-sm", card.glass)}>
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
}

function CoverageCardButton({
  label,
  value,
  hint,
  icon: Icon,
  glass,
  disabled,
  onClick,
}: {
  label: string
  value: number
  hint: string
  icon: typeof TrendingUpIcon
  glass: string
  disabled: boolean
  onClick: () => void
}) {
  const card = (
    <Card
      className={cn(
        "gap-0 overflow-hidden backdrop-blur-md shadow-sm",
        glass,
        !disabled &&
          "transition-colors hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 font-medium">
          <Icon className="size-4" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )

  if (disabled) {
    return <div>{card}</div>
  }

  return (
    <button type="button" onClick={onClick} className="text-left disabled:cursor-wait">
      {card}
    </button>
  )
}
