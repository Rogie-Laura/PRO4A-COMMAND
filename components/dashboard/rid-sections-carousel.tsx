"use client"

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react"

import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { ForeignNationalTable } from "@/components/dashboard/foreign-national-table"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { IntelEligibilityCards } from "@/components/dashboard/intel-eligibility-cards"
import { RidSectionHeader } from "@/components/dashboard/rid-section-header"
import { SurrenderedCtgfTable } from "@/components/dashboard/surrendered-ctgf-table"
import type { CriminalGangsAnalytics } from "@/lib/criminal-gangs-types"
import type { ForeignNationalAnalytics } from "@/lib/foreign-national-types"
import type { IllegalDrugsAnalytics } from "@/lib/illegal-drugs-types"
import type { IntelEligibilityAnalytics } from "@/lib/intel-eligibility-types"
import type { SurrenderedCtgfAnalytics } from "@/lib/surrendered-ctgf-types"
import { cn } from "@/lib/utils"

type RidSectionsCarouselProps = {
  illegalDrugs: IllegalDrugsAnalytics
  criminalGangs: CriminalGangsAnalytics
  surrenderedCtgf: SurrenderedCtgfAnalytics
  foreignNational: ForeignNationalAnalytics
  intelEligibility: IntelEligibilityAnalytics
}

type RidSlide = {
  id: string
  label: string
  dotClassName: string
  content: ReactNode
}

const SWIPE_THRESHOLD_PX = 56

export function RidSectionsCarousel({
  illegalDrugs,
  criminalGangs,
  surrenderedCtgf,
  foreignNational,
  intelEligibility,
}: RidSectionsCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const previousIndexRef = useRef(0)

  const slides: RidSlide[] = [
    {
      id: "illegal-drugs",
      label: "Illegal Drugs",
      dotClassName: "bg-amber-500",
      content: (
        <section className="space-y-4">
          <RidSectionHeader
            title="Illegal Drugs"
            description="HVI at SLI accomplishments"
            uploadedAt={illegalDrugs.lastUpdated}
            dataReady={illegalDrugs.dataReady}
          />
          <IllegalDrugsCards analytics={illegalDrugs} />
        </section>
      ),
    },
    {
      id: "criminal-gangs",
      label: "Criminal Gangs",
      dotClassName: "bg-rose-500",
      content: (
        <section className="space-y-4">
          <RidSectionHeader
            title="Criminal Gangs"
            description="Drug Groups, Gun-for-Hire, at Other Criminal Groups"
            uploadedAt={criminalGangs.lastUpdated}
            dataReady={criminalGangs.dataReady}
          />
          <CriminalGangsCards analytics={criminalGangs} />
        </section>
      ),
    },
    {
      id: "surrendered-ctgf",
      label: "Surrendered CTGs",
      dotClassName: "bg-teal-500",
      content: (
        <section className="space-y-4">
          <SurrenderedCtgfTable analytics={surrenderedCtgf} />
        </section>
      ),
    },
    {
      id: "foreign-national",
      label: "Foreign National",
      dotClassName: "bg-indigo-500",
      content: (
        <section className="space-y-4">
          <ForeignNationalTable analytics={foreignNational} />
        </section>
      ),
    },
    {
      id: "intel-eligibility",
      label: "IEL",
      dotClassName: "bg-sky-500",
      content: (
        <section className="space-y-4">
          <RidSectionHeader
            title="Intelligence Eligibility List"
            description="Authorized vs actual strength, training, seminar, at related intel personnel metrics"
            uploadedAt={intelEligibility.lastUpdated}
            dataReady={intelEligibility.dataReady}
          />
          <IntelEligibilityCards analytics={intelEligibility} />
        </section>
      ),
    },
  ]

  function goToIndex(index: number) {
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1))
  }

  useEffect(() => {
    if (activeIndex === previousIndexRef.current) return
    previousIndexRef.current = activeIndex
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [activeIndex])

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current
    const touch = event.changedTouches[0]
    touchStartRef.current = null
    if (!start || !touch) return

    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y

    // Prefer vertical page scroll when the gesture is mostly up/down.
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy) * 1.15) {
      return
    }

    if (dx < 0) {
      goToIndex(activeIndex + 1)
    } else {
      goToIndex(activeIndex - 1)
    }
  }

  const activeSlide = slides[activeIndex]

  return (
    <>
      <div ref={rootRef} className="scroll-mt-20 space-y-3 md:hidden">
        <p className="text-center text-xs text-muted-foreground">
          Swipe left/right · Illegal Drugs · Criminal Gangs · Surrendered · Foreign National · IEL
        </p>

        <div
          className="touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="RID sections"
        >
          {/* Active section only — avoids blank space from taller sibling slides. */}
          {activeSlide?.content}
        </div>

        <div
          className="flex items-center justify-center gap-2"
          role="tablist"
          aria-label="RID section slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={slide.label}
              onClick={() => goToIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                activeIndex === index
                  ? cn("w-6", slide.dotClassName)
                  : "w-2 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>

      <div className="hidden space-y-6 md:block">
        {slides.map((slide) => (
          <div key={slide.id}>{slide.content}</div>
        ))}
      </div>
    </>
  )
}
