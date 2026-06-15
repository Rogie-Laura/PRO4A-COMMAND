"use client"

import { useCallback, useRef, useState } from "react"

import {
  ICT_STATUS_VARIANTS,
  IctStatusCard,
  type IctStatusVariant,
} from "@/components/dashboard/ict-status-card"
import type { IctStatusSection } from "@/lib/ict-equipment-types"
import { cn } from "@/lib/utils"

type IctStatusCarouselProps = {
  slides: Array<{
    variant: IctStatusVariant
    section: IctStatusSection
  }>
  swipeHint?: string
  ariaLabel?: string
}

export function IctStatusCarousel({
  slides,
  swipeHint,
  ariaLabel = "ICT equipment cards",
}: IctStatusCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || container.clientWidth === 0) return

    const index = Math.round(container.scrollLeft / container.clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1))
  }, [slides.length])

  function scrollToIndex(index: number) {
    const container = scrollRef.current
    if (!container) return

    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    })
    setActiveIndex(index)
  }

  return (
    <div className="space-y-3 lg:hidden">
      {swipeHint ? (
        <p className="text-center text-xs text-muted-foreground">{swipeHint}</p>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={updateActiveIndex}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label={ariaLabel}
      >
        {slides.map((slide) => (
          <div
            key={slide.variant}
            data-slide
            className="w-full shrink-0 snap-center snap-always px-0.5"
          >
            <IctStatusCard section={slide.section} variant={slide.variant} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Status slides">
        {slides.map((slide, index) => (
          <button
            key={slide.variant}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={ICT_STATUS_VARIANTS[slide.variant].shortLabel}
            onClick={() => scrollToIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              activeIndex === index
                ? cn("w-6", ICT_STATUS_VARIANTS[slide.variant].dot)
                : "w-2 bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  )
}
