"use client"

import { useState } from "react"

import { IctOfficeBreakdownSheet } from "@/components/dashboard/ict-office-breakdown-sheet"
import {
  IctStatusCard,
  type IctStatusVariant,
} from "@/components/dashboard/ict-status-card"
import { IctStatusCarousel } from "@/components/dashboard/ict-status-carousel"
import type { IctStatusSection } from "@/lib/ict-equipment-types"

type StatusSlide = {
  variant: IctStatusVariant
  section: IctStatusSection
}

type IctEquipmentStatusSectionsProps = {
  conditionSlides: StatusSlide[]
  sourceSlides: StatusSlide[]
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">Tap a card to view breakdown by PPO</p>
    </div>
  )
}

export function IctEquipmentStatusSections({
  conditionSlides,
  sourceSlides,
}: IctEquipmentStatusSectionsProps) {
  const [selected, setSelected] = useState<StatusSlide | null>(null)
  const [open, setOpen] = useState(false)

  function handleSelect(slide: StatusSlide) {
    setSelected(slide)
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelected(null)
    }
  }

  function renderSlides(slides: StatusSlide[], gridClassName: string) {
    return (
      <>
        <IctStatusCarousel
          slides={slides}
          onSelect={handleSelect}
          swipeHint={
            slides === conditionSlides
              ? "Swipe for Serviceable · Unserviceable · BER"
              : "Swipe for PNP Issued by NHQ · Procured by PRO"
          }
          ariaLabel={
            slides === conditionSlides
              ? "ICT equipment condition cards"
              : "ICT equipment source cards"
          }
        />
        <div className={gridClassName}>
          {slides.map((slide) => (
            <IctStatusCard
              key={slide.variant}
              section={slide.section}
              variant={slide.variant}
              onSelect={() => handleSelect(slide)}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <SectionHeading title="Device Condition" />
        {renderSlides(
          conditionSlides,
          "hidden items-stretch gap-4 lg:grid lg:grid-cols-3",
        )}
      </div>

      <div className="space-y-4">
        <SectionHeading title="Device Source" />
        {renderSlides(sourceSlides, "hidden items-stretch gap-4 lg:grid lg:grid-cols-2")}
      </div>

      <IctOfficeBreakdownSheet
        variant={selected?.variant ?? null}
        section={selected?.section ?? null}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
