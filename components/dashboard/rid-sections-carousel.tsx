"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { ForeignNationalTable } from "@/components/dashboard/foreign-national-table"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { IntelEligibilityCards } from "@/components/dashboard/intel-eligibility-cards"
import { RidSectionHeader } from "@/components/dashboard/rid-section-header"
import { SurrenderedCtgfTable } from "@/components/dashboard/surrendered-ctgf-table"
import { Button } from "@/components/ui/button"
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
  /** Compact label for the ← previous / next → navigation strip. */
  navLabel: string
  dotClassName: string
  content: ReactNode
}

export function RidSectionsCarousel({
  illegalDrugs,
  criminalGangs,
  surrenderedCtgf,
  foreignNational,
  intelEligibility,
}: RidSectionsCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const previousIndexRef = useRef(0)

  const slides: RidSlide[] = [
    {
      id: "illegal-drugs",
      label: "Illegal Drugs",
      navLabel: "Illegal Drugs",
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
      navLabel: "Criminal Gangs",
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
      navLabel: "Surrendered CTG",
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
      navLabel: "Foreign Nationals",
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
      navLabel: "Intelligence Eligibility",
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

  const activeSlide = slides[activeIndex]
  const prevSlide = slides[activeIndex - 1]
  const nextSlide = slides[activeIndex + 1]
  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < slides.length - 1

  return (
    <>
      <div ref={rootRef} className="scroll-mt-20 space-y-3 md:hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 rounded-lg border bg-muted/30 px-1 py-1">
          <Button
            type="button"
            variant="ghost"
            disabled={!canGoPrev}
            aria-label={prevSlide ? `Previous: ${prevSlide.navLabel}` : "Previous section"}
            onClick={() => goToIndex(activeIndex - 1)}
            className="h-auto min-h-8 justify-start gap-0.5 px-1.5 py-1.5 text-left"
          >
            <ChevronLeftIcon className="size-4 shrink-0" />
            <span className="min-w-0 truncate text-[11px] font-medium leading-tight">
              {prevSlide?.navLabel ?? ""}
            </span>
          </Button>

          <span className="px-1 text-xs font-semibold tabular-nums text-muted-foreground">
            {activeIndex + 1}/{slides.length}
          </span>

          <Button
            type="button"
            variant="ghost"
            disabled={!canGoNext}
            aria-label={nextSlide ? `Next: ${nextSlide.navLabel}` : "Next section"}
            onClick={() => goToIndex(activeIndex + 1)}
            className="h-auto min-h-8 justify-end gap-0.5 px-1.5 py-1.5 text-right"
          >
            <span className="min-w-0 truncate text-[11px] font-medium leading-tight">
              {nextSlide?.navLabel ?? ""}
            </span>
            <ChevronRightIcon className="size-4 shrink-0" />
          </Button>
        </div>

        <div aria-label="RID sections">
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
